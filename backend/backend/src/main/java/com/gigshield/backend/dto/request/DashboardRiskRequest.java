package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class DashboardRiskRequest {

    private String zone;

    private String platform;

    private double avgHourlyIncome;

    private double avgDailyHours;

}