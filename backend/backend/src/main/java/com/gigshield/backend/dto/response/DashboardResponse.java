package com.gigshield.backend.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DashboardResponse {

    // Existing fields

    private long claimCount;

    private double totalPayout;

    private String policyTier;

    private String coverageStatus;

    private double weeklyCoverage;

    private double dailyCoverage;

    private LocalDate coverageStart;

    private LocalDate coverageEnd;


    // NEW AI Forecast Fields

    private int overallRiskScore;

    private String rainRisk;

    private String heatRisk;

    private String aqiRisk;

    private String bandhRisk;

    private double predictedIncomeLoss;

    private String forecastMessage;

}