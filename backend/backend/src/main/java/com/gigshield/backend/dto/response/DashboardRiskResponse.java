package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class DashboardRiskResponse {

    private int overallRiskScore;

    private String rainRisk;

    private String heatRisk;

    private String aqiRisk;

    private String bandhRisk;

    private double predictedIncomeLoss;

    private String forecastMessage;

}