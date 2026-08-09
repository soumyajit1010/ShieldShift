package com.gigshield.backend.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class AQIResponse {

    private Coord coord;
    private List<AQIData> list;


    @Data
    public static class Coord {

        private double lon;
        private double lat;
    }


    @Data
    public static class AQIData {

        private Main main;
        private Components components;
        private long dt;
    }


    @Data
    public static class Main {

        private int aqi;
    }


    @Data
    public static class Components {

        private double co;
        private double no;
        private double no2;
        private double o3;
        private double so2;
        private double pm2_5;
        private double pm10;
        private double nh3;
    }
}