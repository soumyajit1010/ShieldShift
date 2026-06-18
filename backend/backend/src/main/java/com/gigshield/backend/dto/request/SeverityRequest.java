package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class SeverityRequest {
    private String disruption_type;
    private double severity_value;
    private double duration_hours;
    private int zone_risk_tier;
    private int time_of_day;
    private double historical_avg_severity;
}