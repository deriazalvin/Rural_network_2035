package com.ruralnetwork.algorithme;

import org.springframework.stereotype.Component;

@Component
public class CalculDistance {

    private static final double RAYON_TERRE_KM = 6371.0;

    /**
     * Calcule la distance en kilomètres entre deux points géographiques
     * en utilisant la formule de Haversine.
     *
     * @param latitude1  Latitude du point de départ (en degrés décimaux)
     * @param longitude1 Longitude du point de départ (en degrés décimaux)
     * @param latitude2  Latitude du point d'arrivée (en degrés décimaux)
     * @param longitude2 Longitude du point d'arrivée (en degrés décimaux)
     * @return Distance en kilomètres entre les deux points
     */
    public double calculerDistanceHaversine(double latitude1, double longitude1,
                                             double latitude2, double longitude2) {
        double deltaLatitude = Math.toRadians(latitude2 - latitude1);
        double deltaLongitude = Math.toRadians(longitude2 - longitude1);

        double lat1Rad = Math.toRadians(latitude1);
        double lat2Rad = Math.toRadians(latitude2);

        double a = Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(deltaLongitude / 2) * Math.sin(deltaLongitude / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distanceKm = RAYON_TERRE_KM * c;

        return Math.round(distanceKm * 100.0) / 100.0;
    }
}