package com.gigshield.backend.dto.response;


import lombok.Data;


@Data
public class WeatherApiResponse {


    private Main main;

    private Rain rain;



    @Data
    public static class Main{

        private double temp;

        private int humidity;

    }



    @Data
    public static class Rain{

        private Double oneHour;

    }

}