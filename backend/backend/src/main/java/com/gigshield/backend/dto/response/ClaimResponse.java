package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class ClaimResponse {

    private Long claimId;

    private String severityClass;

    private double estimatedLoss;

    private double fraudScore;

    private String fraudDecision;

    private double payoutAmount;

    private String claimStatus;


    public Long getClaimId() {
        return claimId;
    }

    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    public String getSeverityClass() {
        return severityClass;
    }

    public void setSeverityClass(String severityClass) {
        this.severityClass = severityClass;
    }

    public double getEstimatedLoss() {
        return estimatedLoss;
    }

    public void setEstimatedLoss(double estimatedLoss) {
        this.estimatedLoss = estimatedLoss;
    }

    public double getFraudScore() {
        return fraudScore;
    }

    public void setFraudScore(double fraudScore) {
        this.fraudScore = fraudScore;
    }

    public String getFraudDecision() {
        return fraudDecision;
    }

    public void setFraudDecision(String fraudDecision) {
        this.fraudDecision = fraudDecision;
    }

    public double getPayoutAmount() {
        return payoutAmount;
    }

    public void setPayoutAmount(double payoutAmount) {
        this.payoutAmount = payoutAmount;
    }

    public String getClaimStatus() {
        return claimStatus;
    }

    public void setClaimStatus(String claimStatus) {
        this.claimStatus = claimStatus;
    }
}