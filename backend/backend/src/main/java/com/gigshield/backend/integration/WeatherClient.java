package com.gigshield.backend.integration;


import com.gigshield.backend.dto.response.WeatherApiResponse;
import com.gigshield.backend.dto.response.WeatherResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;



@Service
public class WeatherClient {


    private final RestTemplate restTemplate;


    @Value("${weather.api.key}")
    private String apiKey;


    @Value("${weather.api.url}")
    private String apiUrl;



    public WeatherClient(){

        this.restTemplate =
                new RestTemplate();

    }



    public WeatherResponse getWeather(
            String city
    ){


        String url =
                apiUrl
                        +
                        "?q="
                        +
                        city
                        +
                        "&appid="
                        +
                        apiKey
                        +
                        "&units=metric";



        WeatherApiResponse response =
                restTemplate.getForObject(
                        url,
                        WeatherApiResponse.class
                );



        WeatherResponse weather =
                new WeatherResponse();



        /*
         * Temperature
         */

        weather.setTemperature(
                response
                        .getMain()
                        .getTemp()
        );



        /*
         * Humidity
         */

        weather.setHumidity(
                response
                        .getMain()
                        .getHumidity()
        );



        /*
         * Rainfall
         *
         * OpenWeather sends:
         *
         * rain:{
         *    "1h":10
         * }
         *
         */


        if(response.getRain()!=null
                &&
                response.getRain().getOneHour()!=null){


            weather.setRainfall(
                    response
                            .getRain()
                            .getOneHour()
            );


        }
        else{


            weather.setRainfall(0);


        }



        return weather;


    }


}