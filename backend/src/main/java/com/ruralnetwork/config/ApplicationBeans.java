package com.ruralnetwork.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration des Beans de l'application
 * Responsabilité unique : créer et configurer les beans
 */
@Configuration
public class ApplicationBeans {

    /**
     * RestTemplate pour effectuer des appels HTTP externes
     * Ex: Appels à OSRM, Nominatim, etc.
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
