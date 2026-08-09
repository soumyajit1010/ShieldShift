package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class PlanPriceResponse {

    private String id;

    private String name;

    private double aiPrice;

    private double maxDaily;

    private double maxWeekly;

    private String label;

    private String badge;

}