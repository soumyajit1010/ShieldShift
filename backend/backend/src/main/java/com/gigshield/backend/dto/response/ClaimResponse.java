package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class ClaimResponse {

    // Image ML result
    private String roadPrediction;

    private Double imageConfidence;

    private Boolean roadBlocked;


    // Claim result
    private Long claimId;

    private String severityClass;

    private double estimatedLoss;

    private double fraudScore;

    private String fraudDecision;

    private double payoutAmount;

    private String claimStatus;

}