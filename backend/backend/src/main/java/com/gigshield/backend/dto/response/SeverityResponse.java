package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class SeverityResponse {
    private String severity_class;
    private double payout_modifier;
    private double confidence;


    public String getSeverity_class() {
        return severity_class;
    }

    public void setSeverity_class(String severity_class) {
        this.severity_class = severity_class;
    }

    public double getPayout_modifier() {
        return payout_modifier;
    }

    public void setPayout_modifier(double payout_modifier) {
        this.payout_modifier = payout_modifier;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }
}