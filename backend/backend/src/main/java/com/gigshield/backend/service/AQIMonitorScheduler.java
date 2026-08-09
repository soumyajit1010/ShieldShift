package com.gigshield.backend.service;

import com.gigshield.backend.model.Zone;
import com.gigshield.backend.repository.ZoneRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AQIMonitorScheduler {

    @Autowired
    private AQIMonitorService aqiMonitorService;


    @Autowired
    private ZoneRepository zoneRepository;


    /*
     * Run every 10 minutes.
     *
     * OpenWeather recommends not calling
     * the API more frequently than once
     * every 10 minutes per location.
     */
    @Scheduled(
            fixedRate = 100000
    )
    public void checkAQIAutomatically() {


        System.out.println(
                "Running AQI Monitor..."
        );


        for(Zone zone :
                zoneRepository.findAll()) {


            try {

                aqiMonitorService.checkAQI(
                        zone.getId()
                );

            }
            catch(Exception e) {

                System.out.println(
                        "AQI check failed for "
                                + zone.getName()
                                + " : "
                                + e.getMessage()
                );
            }
        }
    }
}