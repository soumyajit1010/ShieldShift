package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class PremiumRequest {

    private String plan;

    private String risk_zone;

    private int claim_history;

    private int policy_year;

    private int heat_addon;

    private double monthly_earnings;

    private double daily_hours;

    private String vehicle_type;

    private String platform;

    private int disruption_days_hist;

}