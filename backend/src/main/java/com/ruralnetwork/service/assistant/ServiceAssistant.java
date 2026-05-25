package com.ruralnetwork.service.assistant;

import com.ruralnetwork.depot.CamionDepot;
import com.ruralnetwork.depot.RouteDepot;
import com.ruralnetwork.depot.VillageDepot;
import com.ruralnetwork.entite.Camion;
import com.ruralnetwork.entite.Route;
import com.ruralnetwork.entite.Village;
import com.ruralnetwork.service.meteo.ServiceMeteo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceAssistant {

    @Value("${gemini.api.key}")
    private String geminiKey;

    private final VillageDepot villageDepot;
    private final RouteDepot routeDepot;
    private final CamionDepot camionDepot;
    private final ServiceMeteo serviceMeteo;
    private final RestTemplate restTemplate;
    private final ObjectMapper mapper;

    public ServiceAssistant(VillageDepot villageDepot, RouteDepot routeDepot,
                            CamionDepot camionDepot, ServiceMeteo serviceMeteo,
                            RestTemplate restTemplate) {
        this.villageDepot = villageDepot;
        this.routeDepot = routeDepot;
        this.camionDepot = camionDepot;
        this.serviceMeteo = serviceMeteo;
        this.restTemplate = restTemplate;
        this.mapper = new ObjectMapper();
    }

    public String poserQuestion(Long utilisateurId, String question) {
        String contexte = construireContexte(utilisateurId) + "\nQuestion: " + question;
        return appelerGemini(question, contexte);
    }

    private String construireContexte(Long utilisateurId) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("Tu es un assistant expert en logistique agricole pour Rural Network 2035 a Madagascar. ");
        ctx.append("Reponds en francais de maniere concise et utile, en texte brut uniquement. ");
        ctx.append("N'utilise PAS de markdown, d'asterisques (*), de gras, d'italique ou de tout autre formatage. ");
        ctx.append("Utilise des tirets (-) pour les listes et des emojis simples si necessaire.\n\n");

        List<Village> villages = villageDepot.findByUtilisateurIdOrderByNomAsc(utilisateurId);
        List<Route> routes = routeDepot.findByUtilisateurId(utilisateurId);
        List<Camion> camions = camionDepot.findByUtilisateurId(utilisateurId);

        ctx.append("=== DONNEES ACTUELLES ===\n");

        if (!villages.isEmpty()) {
            ctx.append("Villages (").append(villages.size()).append("):\n");
            for (Village v : villages) {
                ctx.append("- ").append(v.getNom()).append(" (production: ").append(v.getVolumeProduction()).append(" kg, coord: ").append(v.getLatitude()).append(",").append(v.getLongitude()).append(")\n");
                try {
                    var meteo = serviceMeteo.obtenirMeteoParCoords(v.getLatitude(), v.getLongitude());
                    ctx.append("  Meteo: ").append(meteo.getTemperature()).append("C, ").append(meteo.getDescription()).append(", vent ").append(meteo.getVentVitesse()).append(" km/h\n");
                } catch (Exception e) {
                    ctx.append("  Meteo: indisponible\n");
                }
            }
        }

        if (!routes.isEmpty()) {
            long bloquees = routes.stream().filter(r -> Boolean.TRUE.equals(r.getEstBloquee())).count();
            ctx.append("Routes: ").append(routes.size()).append(" total, ").append(bloquees).append(" bloquees\n");
        }

        if (!camions.isEmpty()) {
            long dispo = camions.stream().filter(c -> c.getEtat() == Camion.EtatCamion.DISPONIBLE).count();
            ctx.append("Camions: ").append(camions.size()).append(" total, ").append(dispo).append(" disponibles\n");
        }

        return ctx.toString();
    }

    private String appelerGemini(String question, String contexte) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + geminiKey;

            ObjectNode root = mapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");
            ObjectNode content = contents.addObject();
            ArrayNode parts = content.putArray("parts");
            ObjectNode part = parts.addObject();
            part.put("text", contexte);

            String body = mapper.writeValueAsString(root);
            String response = restTemplate.postForObject(url, body, String.class);

            JsonNode json = mapper.readTree(response);
            JsonNode text = json.path("candidates").get(0).path("content").path("parts").get(0).path("text");
            return nettoyerReponse(text.asText("Desole, je n'ai pas pu traiter votre demande."));
        } catch (Exception e) {
            return "Erreur IA: " + e.getMessage();
        }
    }

    private String nettoyerReponse(String reponse) {
        return reponse
            .replaceAll("\\*\\*\\*", "")
            .replaceAll("\\*\\*", "")
            .replaceAll("__", "")
            .replaceAll("`", "")
            .replaceAll("\\[\\s*\\^?\\d*\\s*\\]", "")
            .replaceAll("\\s*\n\\s*", "\n")
            .trim();
    }
}
