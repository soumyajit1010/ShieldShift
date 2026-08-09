package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class WeatherResponse {

    private double temperature;

    private double rainfall;

    private double humidity;

}