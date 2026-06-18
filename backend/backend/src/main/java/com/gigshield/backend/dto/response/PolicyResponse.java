package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class PolicyResponse {

    private Long policyId;

    private String tier;

    private double premium;

    private double maxDailyPayout;

    private double maxWeeklyPayout;

    private String status;


    
}