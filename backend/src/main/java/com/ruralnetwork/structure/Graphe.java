package com.ruralnetwork.structure;

import com.ruralnetwork.entite.Route;
import java.util.*;

/**
 * Graphe (Liste d'Adjacence)
 * Structure de données pour modéliser le réseau rural malgache
 * Complexité spatiale: O(V + E) où V = nombre de villages, E = nombre de routes
 */
public class Graphe {

    private Map<String, List<AretePonderee>> listeAdjacence = new HashMap<>();
    private Map<String, VillageInfo> villages = new HashMap<>();

    public static class VillageInfo {
        private String id;
        private String nom;
        private Double latitude;
        private Double longitude;
        private Double volumeProduction;

        public VillageInfo(String id, String nom, Double latitude, Double longitude, Double volumeProduction) {
            this.id = id;
            this.nom = nom;
            this.latitude = latitude;
            this.longitude = longitude;
            this.volumeProduction = volumeProduction;
        }

        public String getId() { return id; }
        public String getNom() { return nom; }
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }
        public Double getVolumeProduction() { return volumeProduction; }
    }

    public static class AretePonderee {
        private String destination;
        private Double distance;
        private String qualite;
        private Boolean estBloquee;
        private Double poids;

        public AretePonderee(String destination, Double distance, String qualite, Boolean estBloquee, Double poids) {
            this.destination = destination;
            this.distance = distance;
            this.qualite = qualite;
            this.estBloquee = estBloquee;
            this.poids = poids;
        }

        public String getDestination() { return destination; }
        public Double getDistance() { return distance; }
        public String getQualite() { return qualite; }
        public Boolean getEstBloquee() { return estBloquee; }
        public Double getPoids() { return poids; }
        public void setEstBloquee(Boolean estBloquee) { this.estBloquee = estBloquee; }
    }

    // Explicit getters/setters for inner classes (avoid Lombok reliance)
    public static class VillageInfoExplicit {
        private String id;
        private String nom;
        private Double latitude;
        private Double longitude;
        private Double volumeProduction;

        public VillageInfoExplicit(String id, String nom, Double latitude, Double longitude, Double volumeProduction) {
            this.id = id; this.nom = nom; this.latitude = latitude; this.longitude = longitude; this.volumeProduction = volumeProduction;
        }

        public String getId() { return id; }
        public String getNom() { return nom; }
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }
        public Double getVolumeProduction() { return volumeProduction; }
    }

    public static class AretePondereeExplicit {
        private String destination;
        private Double distance;
        private String qualite;
        private Boolean estBloquee;
        private Double poids;

        public AretePondereeExplicit(String destination, Double distance, String qualite, Boolean estBloquee, Double poids) {
            this.destination = destination; this.distance = distance; this.qualite = qualite; this.estBloquee = estBloquee; this.poids = poids;
        }

        public String getDestination() { return destination; }
        public Double getDistance() { return distance; }
        public String getQualite() { return qualite; }
        public Boolean getEstBloquee() { return estBloquee; }
        public Double getPoids() { return poids; }
        public void setEstBloquee(Boolean estBloquee) { this.estBloquee = estBloquee; }
    }

    public void ajouterVillage(String id, VillageInfo info) {
        villages.put(id, info);
        listeAdjacence.putIfAbsent(id, new ArrayList<>());
    }

    public VillageInfo obtenirVillage(String id) {
        return villages.get(id);
    }

    public Collection<VillageInfo> obtenirTousLesVillages() {
        return villages.values();
    }

    public void ajouterRoute(String villageDepart, String villageArrivee,
                           Double distance, String qualite, Boolean estBloquee) {
        Double poids = calculerPoids(distance, qualite);

        listeAdjacence.computeIfAbsent(villageDepart, k -> new ArrayList<>())
                .add(new AretePonderee(villageArrivee, distance, qualite, estBloquee, poids));

        listeAdjacence.computeIfAbsent(villageArrivee, k -> new ArrayList<>())
                .add(new AretePonderee(villageDepart, distance, qualite, estBloquee, poids));
    }

    private Double calculerPoids(Double distance, String qualite) {
        Double facteur = switch (qualite) {
            case "BONNE" -> 1.0;
            case "MOYENNE" -> 1.3;
            case "MAUVAISE" -> 1.6;
            default -> 1.3;
        };
        return distance * facteur;
    }

    public List<AretePonderee> obtenirVoisins(String villageId) {
        List<AretePonderee> aretes = listeAdjacence.getOrDefault(villageId, new ArrayList<>());
        return aretes.stream()
                .filter(a -> !a.estBloquee)
                .toList();
    }

    public void bloquerRoute(String villageDepart, String villageArrivee) {
        modifierStatutRoute(villageDepart, villageArrivee, true);
        modifierStatutRoute(villageArrivee, villageDepart, true);
    }

    public void debloquerRoute(String villageDepart, String villageArrivee) {
        modifierStatutRoute(villageDepart, villageArrivee, false);
        modifierStatutRoute(villageArrivee, villageDepart, false);
    }

    private void modifierStatutRoute(String de, String vers, boolean estBloquee) {
        List<AretePonderee> aretes = listeAdjacence.getOrDefault(de, new ArrayList<>());
        aretes.stream()
                .filter(a -> a.getDestination().equals(vers))
                .forEach(a -> a.setEstBloquee(estBloquee));
    }

    public int nombreVillages() {
        return villages.size();
    }

    public void vider() {
        listeAdjacence.clear();
        villages.clear();
    }
}
