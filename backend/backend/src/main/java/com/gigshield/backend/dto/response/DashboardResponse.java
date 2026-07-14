package com.gigshield.backend.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class DashboardResponse {

    private long claimCount;

    private double totalPayout;

    private String policyTier;

    private String coverageStatus;

    private double weeklyCoverage;

    private double dailyCoverage;

    private LocalDate coverageStart;

    private LocalDate coverageEnd;

}