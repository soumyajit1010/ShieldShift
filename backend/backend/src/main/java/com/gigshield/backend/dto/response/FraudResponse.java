package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class FraudResponse {
    private double fraud_score;
    private String decision;


    public double getFraud_score() {
        return fraud_score;
    }

    public void setFraud_score(double fraud_score) {
        this.fraud_score = fraud_score;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }
}