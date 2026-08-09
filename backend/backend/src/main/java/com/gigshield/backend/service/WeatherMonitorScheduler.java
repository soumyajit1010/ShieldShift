package com.gigshield.backend.service;


import com.gigshield.backend.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;



@Component
public class WeatherMonitorScheduler {


    @Autowired
    private WeatherMonitorService weatherMonitorService;


    @Autowired
    private ZoneRepository zoneRepository;



    /*
        Runs every 100 seconds for testing

        Production:
        900000 ms = 15 minutes
    */
    @Scheduled(
            fixedRate = 100000
    )
    public void checkWeatherAutomatically(){


        System.out.println(
                "Running Weather Monitor..."
        );


        zoneRepository.findAll()
                .forEach(zone -> {


                    try {


                        System.out.println(
                                "Checking zone : "
                                        + zone.getName()
                        );


                        weatherMonitorService.checkWeather(
                                zone.getId()
                        );


                    }
                    catch(Exception e){


                        System.out.println(
                                "Weather check failed for "
                                        + zone.getName()
                        );


                        System.out.println(
                                e.getMessage()
                        );


                    }


                });


    }


}