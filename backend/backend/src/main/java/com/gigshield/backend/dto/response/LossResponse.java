package com.gigshield.backend.dto.response;

import lombok.Data;


@Data
public class LossResponse {
    private double estimated_loss_inr;


    public double getEstimated_loss_inr() {
        return estimated_loss_inr;
    }

    public void setEstimated_loss_inr(double estimated_loss_inr) {
        this.estimated_loss_inr = estimated_loss_inr;
    }
}