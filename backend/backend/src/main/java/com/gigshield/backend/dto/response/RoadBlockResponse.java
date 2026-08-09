package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class RoadBlockResponse {

    private boolean success;

    private DataResponse data;


    @Data
    public static class DataResponse {

        private String prediction;

        private double confidence;

        private boolean is_blocked;

    }

}