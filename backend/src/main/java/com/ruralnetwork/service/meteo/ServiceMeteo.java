package com.ruralnetwork.service.meteo;

import com.ruralnetwork.dto.MeteoDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.logging.Logger;

@Service
public class ServiceMeteo {

    private static final Logger logger = Logger.getLogger(ServiceMeteo.class.getName());

    @Value("${weather.api.url:https://api.openweathermap.org/data/2.5}")
    private String apiUrl;

    @Value("${weather.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ServiceMeteo(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
    }

    public MeteoDTO obtenirMeteoParCoords(double lat, double lon) {
        try {
            String url = String.format("%s/weather?lat=%f&lon=%f&appid=%s&units=metric&lang=fr",
                    apiUrl, lat, lon, apiKey);
            logger.info("Appel météo: " + url.replace(apiKey, "***"));

            String response = restTemplate.getForObject(url, String.class);
            if (response == null) {
                throw new RuntimeException("Réponse météo vide");
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode main = root.get("main");
            JsonNode weather = root.get("weather").get(0);
            JsonNode wind = root.get("wind");

            double temperature = main.get("temp").asDouble();
            double ressenti = main.get("feels_like").asDouble();
            int humidite = main.get("humidity").asInt();
            String description = weather.get("description").asText();
            String icone = weather.get("icon").asText();
            double ventVitesse = wind.get("speed").asDouble();
            String ville = root.has("name") ? root.get("name").asText() : "Inconnu";

            return new MeteoDTO(temperature, ressenti, humidite, description, icone, ventVitesse, ville, lat, lon);

        } catch (RestClientException e) {
            logger.severe("Erreur appel API météo: " + e.getMessage());
            throw new RuntimeException("Service météo indisponible: " + e.getMessage());
        } catch (Exception e) {
            logger.severe("Erreur parsing météo: " + e.getMessage());
            throw new RuntimeException("Erreur traitement météo: " + e.getMessage());
        }
    }
}
