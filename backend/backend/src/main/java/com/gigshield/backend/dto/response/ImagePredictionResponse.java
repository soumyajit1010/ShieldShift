package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class ImagePredictionResponse {

    private boolean success;

    private ImageData data;


    @Data
    public static class ImageData {

        private String prediction;

        private double confidence;

        private boolean isBlocked;

    }

}