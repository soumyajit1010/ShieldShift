package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class FraudRequest {
    private int worker_id;
    private double distance_to_zone_km;
    private String platform_status;
    private int claim_frequency_30d;
    private double avg_claim_amount_30d;
    private int hours_since_last_claim;
    private boolean device_id_match;
    private double gps_trajectory_score;
    private int event_cluster_count;
}