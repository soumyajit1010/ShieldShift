package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class LossRequest {
    private String disruption_type;
    private String severity_class;
    private double duration_hours;
    private double worker_avg_hourly_income;
    private int zone_risk_tier;
    private int time_of_day;
}