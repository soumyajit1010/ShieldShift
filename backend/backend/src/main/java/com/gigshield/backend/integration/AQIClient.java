package com.gigshield.backend.integration;

import com.gigshield.backend.dto.response.AQIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AQIClient {

    private final RestTemplate restTemplate =
            new RestTemplate();


    @Value("${openweather.api.key}")
    private String apiKey;


    /*
     * OpenWeather Air Pollution API
     *
     * Requires latitude and longitude.
     */
    private final String BASE_URL =
            "https://api.openweathermap.org/data/2.5/air_pollution";


    public AQIResponse getAQI(
            double latitude,
            double longitude
    ) {


        String url =
                UriComponentsBuilder
                        .fromUriString(BASE_URL)
                        .queryParam("lat", latitude)
                        .queryParam("lon", longitude)
                        .queryParam("appid", apiKey)
                        .toUriString();


        System.out.println(
                "Calling AQI API..."
        );


        return restTemplate.getForObject(
                url,
                AQIResponse.class
        );
    }
}