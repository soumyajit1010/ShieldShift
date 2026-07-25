package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class PremiumResponse {

    private boolean success;

    private PremiumData data;


    @Data
    public static class PremiumData {

        private double final_price;

    }
}