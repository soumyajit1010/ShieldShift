package com.gigshield.backend.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PolicyResponse {

    private Long policyId;

    private String tier;

    private double premium;

    private double maxDailyPayout;

    private double maxWeeklyPayout;

    private String status;

    private LocalDate coverageStart;

    private LocalDate coverageEnd;

    
}