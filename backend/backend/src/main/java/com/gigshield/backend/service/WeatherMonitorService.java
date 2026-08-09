package com.gigshield.backend.service;


import com.gigshield.backend.dto.response.WeatherResponse;
import com.gigshield.backend.integration.WeatherClient;
import com.gigshield.backend.model.DisruptionEvent;
import com.gigshield.backend.model.Zone;
import com.gigshield.backend.model.enums.EventType;
import com.gigshield.backend.repository.DisruptionEventRepository;
import com.gigshield.backend.repository.ZoneRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;



@Service
public class WeatherMonitorService {


    @Autowired
    private WeatherClient weatherClient;


    @Autowired
    private DisruptionEventRepository eventRepository;


    @Autowired
    private ZoneRepository zoneRepository;




    public void checkWeather(
            Long zoneId
    ){


        Zone zone =
                zoneRepository.findById(zoneId)
                .orElseThrow();



        WeatherResponse weather =
                weatherClient.getWeather(
                        zone.getName()
                );

        System.out.println("====================");
        System.out.println("ZONE : " + zone.getName());
        System.out.println("TEMPERATURE : " + weather.getTemperature());
        System.out.println("RAINFALL : " + weather.getRainfall());
        System.out.println("HUMIDITY : " + weather.getHumidity());
        System.out.println("====================");

        /*
            Decision Engine

            Rainfall > 70mm

            Create Heavy Rain Event

        */


        if(weather.getRainfall() > 70){



            DisruptionEvent event =
                    new DisruptionEvent();


            event.setEventType(
                    EventType.HEAVY_RAIN
            );


            event.setZone(zone);



            event.setSeverityValue(
                    0.85
            );


            event.setTriggeredAt(
                    LocalDateTime.now()
            );


            event.setIsVerified(
                    true
            );

            event.setDataSource("WEATHER_API");

            boolean exists =
                    eventRepository
                            .existsByZoneIdAndEventTypeAndEndedAtIsNull(
                                    zoneId,
                                    EventType.HEAVY_RAIN
                            );


            if(exists){

                System.out.println(
                        "Active HEAVY_RAIN event already exists"
                );

                return;

            }

            eventRepository.save(event);


        }


    }

}