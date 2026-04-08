package com.ruralnetwork.service;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.core5.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service IA avec Hugging Face Inference API (gratuit, sans clé)
 * Utilise le modèle de génération de texte publique
 */
@Service
public class AssistantIAService {

    private final VillageDepot villageDepot;
    private final RouteDepot routeDepot;

    public AssistantIAService(VillageDepot villageDepot, RouteDepot routeDepot) {
        this.villageDepot = villageDepot;
        this.routeDepot = routeDepot;
    }

    private static final String HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/gpt2";
    private static final Gson gson = new Gson();

    @Value("${huggingface.api.key:}")
    private String huggingfaceApiKey;

    public String obtenirRecommandation(String question) {
        try {
            // Analyser la question et générer une réponse avec IA
            String contexte = construireContexte();
            String prompt = construirePrompt(question, contexte);

            return genererReponseIA(prompt);
        } catch (Exception e) {
            // Fallback sur analyse locale
            return genererReponseLocal(question);
        }
    }

    private String construireContexte() {
        List<Village> villages = villageDepot.findAll();
        List<Route> routes = routeDepot.findAll();

        StringBuilder contexte = new StringBuilder();
        contexte.append("Réseau rural avec ").append(villages.size()).append(" villages et ")
                .append(routes.size()).append(" routes. ");

        Double productionTotale = villages.stream()
                .mapToDouble(Village::getVolumeProduction)
                .sum();
        contexte.append("Production totale: ").append(String.format("%.0f", productionTotale))
                .append(" kg. ");

        long routesBloquees = routes.stream().filter(Route::getEstBloquee).count();
        contexte.append(routesBloquees).append(" routes bloquées. ");

        return contexte.toString();
    }

    private String construirePrompt(String question, String contexte) {
        return "Contexte: " + contexte + "\nQuestion: " + question +
               "\nRépondez en tant qu'assistant agricole intelligent pour Madagascar 2035:";
    }

    private String genererReponseIA(String prompt) throws Exception {
        CloseableHttpClient client = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(HUGGING_FACE_API_URL);

        // Créer la requête
        JsonObject requestBody = new JsonObject();
        requestBody.addProperty("inputs", prompt);
        requestBody.addProperty("parameters", "{\"max_length\": 200}");

        httpPost.setEntity(new StringEntity(requestBody.toString(), ContentType.APPLICATION_JSON));
        if (huggingfaceApiKey != null && !huggingfaceApiKey.isBlank()) {
            httpPost.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + huggingfaceApiKey);
        }

        // Exécuter la requête
        return client.execute(httpPost, response -> {
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(response.getEntity().getContent())
            );
            String result = reader.lines().collect(Collectors.joining());

            try {
                JsonArray jsonArray = gson.fromJson(result, JsonArray.class);
                if (jsonArray != null && jsonArray.size() > 0) {
                    return jsonArray.get(0).getAsJsonObject()
                            .get("generated_text")
                            .getAsString();
                }
            } catch (Exception e) {
                // En cas d'erreur, utiliser le fallback
            }

            return genererReponseLocal(prompt);
        });
    }

    public String genererReponseLocal(String question) {
        String questionMin = question.toLowerCase();

        if (questionMin.contains("meilleur") && questionMin.contains("départ")) {
            return analyzerMeilleurDepart();
        }

        if (questionMin.contains("optimis") || questionMin.contains("tournée")) {
            return "Pour optimiser votre tournée, utilisez l'algorithme glouton du plus proche voisin. " +
                   "Commencez par le village le plus connecté, puis visitez toujours le village non visité le plus proche " +
                   "qui peut encore être chargé dans votre camion. Les distances sont calculées avec l'algorithme de Dijkstra " +
                   "qui tient compte de la qualité des routes.";
        }

        if (questionMin.contains("qualité") && questionMin.contains("route")) {
            return analyserQualiteRoutes();
        }

        if (questionMin.contains("combien") && questionMin.contains("village")) {
            return analyserCapaciteVisite();
        }

        if (questionMin.contains("production")) {
            return analyserProduction();
        }

        if (questionMin.contains("distance")) {
            return analyserDistances();
        }

        return "Je peux vous aider à analyser votre réseau rural. " +
               "Posez-moi des questions sur les villages, les routes, l'optimisation des tournées, " +
               "ou la production agricole pour obtenir des recommandations intelligentes.";
    }

    private String analyzerMeilleurDepart() {
        List<Village> villages = villageDepot.findAll();
        List<Route> routes = routeDepot.findAll();

        if (villages.isEmpty()) {
            return "Aucun village enregistré pour l'analyse.";
        }

        Map<String, Integer> connexions = new HashMap<>();
        villages.forEach(v -> connexions.put(v.getId(), 0));

        routes.forEach(route -> {
            if (!route.getEstBloquee()) {
                connexions.put(route.getVillageDepart().getId(),
                    connexions.getOrDefault(route.getVillageDepart().getId(), 0) + 1);
                connexions.put(route.getVillageArrivee().getId(),
                    connexions.getOrDefault(route.getVillageArrivee().getId(), 0) + 1);
            }
        });

        Village meilleurVillage = villages.stream()
                .max(Comparator.comparingInt(v -> connexions.getOrDefault(v.getId(), 0)))
                .orElse(villages.get(0));

        int maxConnexions = connexions.getOrDefault(meilleurVillage.getId(), 0);

        return String.format(
            "Le meilleur village de départ est \"%s\" avec %d connexions actives. " +
            "C'est le point le plus central du réseau, offrant le plus d'options de routes.",
            meilleurVillage.getNom(), maxConnexions
        );
    }

    private String analyserQualiteRoutes() {
        List<Route> routes = routeDepot.findAll();

        if (routes.isEmpty()) {
            return "Aucune route enregistrée pour l'analyse.";
        }

        long bonnes = routes.stream().filter(r -> r.getQualiteRoute().name().equals("BONNE")).count();
        long moyennes = routes.stream().filter(r -> r.getQualiteRoute().name().equals("MOYENNE")).count();
        long mauvaises = routes.stream().filter(r -> r.getQualiteRoute().name().equals("MAUVAISE")).count();

        double total = routes.size();
        double pctBonne = (bonnes / total) * 100;
        double pctMoyenne = (moyennes / total) * 100;
        double pctMauvaise = (mauvaises / total) * 100;

        return String.format(
            "Analyse de la qualité des routes:\n" +
            "- Bonnes: %d (%.1f%%)\n" +
            "- Moyennes: %d (%.1f%%)\n" +
            "- Mauvaises: %d (%.1f%%)\n\n" +
            "Conseil: Priorisez les bonnes routes pour réduire l'usure du véhicule et le temps de trajet.",
            bonnes, pctBonne, moyennes, pctMoyenne, mauvaises, pctMauvaise
        );
    }

    private String analyserCapaciteVisite() {
        List<Village> villages = villageDepot.findAll();

        if (villages.isEmpty()) {
            return "Aucun village enregistré pour l'analyse.";
        }

        double capaciteStandard = 5000;
        List<Village> villagesTries = villages.stream()
                .sorted(Comparator.comparingDouble(Village::getVolumeProduction))
                .collect(Collectors.toList());

        double charge = 0;
        int nombre = 0;

        for (Village v : villagesTries) {
            if (charge + v.getVolumeProduction() <= capaciteStandard) {
                charge += v.getVolumeProduction();
                nombre++;
            } else {
                break;
            }
        }

        return String.format(
            "Avec un camion de capacité standard (5000 kg), vous pouvez visiter jusqu'à %d villages " +
            "dans une seule tournée en collectant %.0f kg de production.",
            nombre, charge
        );
    }

    private String analyserProduction() {
        List<Village> villages = villageDepot.findAll();

        if (villages.isEmpty()) {
            return "Aucun village enregistré pour l'analyse.";
        }

        double productionTotale = villages.stream()
                .mapToDouble(Village::getVolumeProduction)
                .sum();

        double productionMoyenne = productionTotale / villages.size();

        Village villageMaxProd = villages.stream()
                .max(Comparator.comparingDouble(Village::getVolumeProduction))
                .orElse(villages.get(0));

        return String.format(
            "Production agricole totale: %.0f kg\n" +
            "Production moyenne par village: %.0f kg\n" +
            "Village avec la plus grande production: %s (%.0f kg)",
            productionTotale, productionMoyenne,
            villageMaxProd.getNom(), villageMaxProd.getVolumeProduction()
        );
    }

    private String analyserDistances() {
        List<Route> routes = routeDepot.findAll();

        if (routes.isEmpty()) {
            return "Aucune route enregistrée pour l'analyse.";
        }

        double distanceTotale = routes.stream()
                .mapToDouble(Route::getDistance)
                .sum();

        double distanceMoyenne = distanceTotale / routes.size();

        double distanceMin = routes.stream()
                .mapToDouble(Route::getDistance)
                .min()
                .orElse(0);

        double distanceMax = routes.stream()
                .mapToDouble(Route::getDistance)
                .max()
                .orElse(0);

        return String.format(
            "Analyse des distances:\n" +
            "- Distance moyenne: %.2f km\n" +
            "- Route la plus courte: %.2f km\n" +
            "- Route la plus longue: %.2f km\n" +
            "- Distance totale du réseau: %.2f km",
            distanceMoyenne, distanceMin, distanceMax, distanceTotale
        );
    }
}
