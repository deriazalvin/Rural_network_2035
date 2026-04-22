package com.ruralnetwork.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.logging.Logger;

/**
 * Service d'accès à l'API OSRM (Open Source Routing Machine)
 * pour calculer les distances réelles entre les villages via les routes.
 * Configure sur localhost:5000 (OSRM local via Docker)
 */
@Service
public class OsrmRoutingService {

    private static final Logger logger = Logger.getLogger(OsrmRoutingService.class.getName());
    
    @Value("${osrm.api.url:http://localhost:5000}")
    private String osrmBaseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OsrmRoutingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Calcule la distance réelle entre deux points via l'API OSRM locale
     * 
     * @param lat1 Latitude du départ
     * @param lon1 Longitude du départ
     * @param lat2 Latitude de l'arrivée
     * @param lon2 Longitude de l'arrivée
     * @return Distance en kilomètres
     * @throws RuntimeException si l'API OSRM n'est pas disponible
     */
    public double obtenirDistanceRoutiere(double lat1, double lon1, double lat2, double lon2) {
        try {
            // Format OSRM: /route/v1/driving/lon1,lat1;lon2,lat2
            String coordinates = String.format("%f,%f;%f,%f", lon1, lat1, lon2, lat2);
            String url = osrmBaseUrl + "/route/v1/driving/" + coordinates + "?overview=false";
            
            logger.info("Appel OSRM: " + url);
            
            // Appel à l'API OSRM
            String response = restTemplate.getForObject(url, String.class);
            if (response == null) {
                throw new RuntimeException("OSRM a retourné une réponse vide");
            }
            
            // Parse la réponse JSON
            JsonNode root = objectMapper.readTree(response);
            
            // Vérifie le code de statut
            String code = root.get("code").asText();
            if (!"Ok".equals(code)) {
                String message = root.has("message") ? root.get("message").asText() : code;
                throw new RuntimeException("OSRM error - code: " + message);
            }
            
            // Récupère the distance en mètres de la première route
            if (!root.has("routes") || root.get("routes").size() == 0) {
                throw new RuntimeException("OSRM n'a trouvé aucune route entre les deux points");
            }
            
            double distanceMetres = root.get("routes").get(0).get("distance").asDouble();
            
            // Conversion en kilomètres et arrondir à 2 décimales
            double distanceKm = Math.round((distanceMetres / 1000.0) * 100.0) / 100.0;
            
            logger.info("Distance OSRM calculée: " + distanceKm + " km");
            return distanceKm;
            
        } catch (RestClientException e) {
            String errorMsg = "Erreur connexion OSRM - L'API n'est probablement pas accessible sur " + osrmBaseUrl;
            logger.severe(errorMsg);
            throw new RuntimeException(errorMsg + ": " + e.getMessage(), e);
            
        } catch (IOException e) {
            String errorMsg = "Erreur parsing réponse OSRM";
            logger.severe(errorMsg);
            throw new RuntimeException(errorMsg + ": " + e.getMessage(), e);
            
        } catch (Exception e) {
            String errorMsg = "Erreur calcul distance OSRM";
            logger.severe(errorMsg);
            throw new RuntimeException(errorMsg + ": " + e.getMessage(), e);
        }
    }
}