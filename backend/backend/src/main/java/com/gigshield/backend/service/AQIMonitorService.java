package com.gigshield.backend.service;

import com.gigshield.backend.dto.response.AQIResponse;
import com.gigshield.backend.integration.AQIClient;
import com.gigshield.backend.model.DisruptionEvent;
import com.gigshield.backend.model.Zone;
import com.gigshield.backend.model.enums.EventType;
import com.gigshield.backend.repository.DisruptionEventRepository;
import com.gigshield.backend.repository.ZoneRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AQIMonitorService {

    @Autowired
    private AQIClient aqiClient;


    @Autowired
    private ZoneRepository zoneRepository;


    @Autowired
    private DisruptionEventRepository eventRepository;


    public void checkAQI(Long zoneId) {


        /*
         * =================================================
         * 1. Find zone
         * =================================================
         */

        Zone zone =
                zoneRepository.findById(zoneId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Zone not found: "
                                                + zoneId
                                )
                        );


        /*
         * =================================================
         * 2. Call AQI API
         * =================================================
         */

        AQIResponse response =
                aqiClient.getAQI(
                        zone.getLatitude(),
                        zone.getLongitude()
                );


        /*
         * =================================================
         * 3. Validate response
         * =================================================
         */

        if (response == null
                || response.getList() == null
                || response.getList().isEmpty()) {

            System.out.println(
                    "No AQI data received for "
                            + zone.getName()
            );

            return;
        }


        /*
         * =================================================
         * 4. Get AQI
         * =================================================
         */

        AQIResponse.AQIData data =
                response.getList().get(0);


        int aqi =
                data.getMain().getAqi();


        System.out.println(
                "===================="
        );

        System.out.println(
                "ZONE : "
                        + zone.getName()
        );

        System.out.println(
                "AQI : "
                        + aqi
        );

        System.out.println(
                "PM2.5 : "
                        + data
                        .getComponents()
                        .getPm2_5()
        );

        System.out.println(
                "PM10 : "
                        + data
                        .getComponents()
                        .getPm10()
        );

        System.out.println(
                "===================="
        );



        /*
         * =================================================
         * 5. Decision Engine
         *
         * OpenWeather AQI:
         *
         * 1 = Good
         * 2 = Fair
         * 3 = Moderate
         * 4 = Poor
         * 5 = Very Poor
         *
         * AQI 4 or 5 = severe
         * =================================================
         */

        if (aqi >= 4) {

            /*
             * =================================================
             * 6. Prevent duplicate active events
             * =================================================
             */

            boolean exists =
                    eventRepository
                            .existsByZoneIdAndEventTypeAndEndedAtIsNull(
                                    zoneId,
                                    EventType.SEVERE_AQI
                            );

            if (exists) {

                System.out.println(
                        "Active SEVERE_AQI event already exists"
                );

                return;
            }

            /*
             * =================================================
             * 7. Create disruption event
             * =================================================
             */

            DisruptionEvent event =
                    new DisruptionEvent();

            event.setEventType(
                    EventType.SEVERE_AQI
            );

            event.setZone(zone);

            /*
             * AQI 4 → 0.80
             * AQI 5 → 1.00
             */

            double severity =
                    aqi == 4
                            ? 0.80
                            : 1.00;

            event.setSeverityValue(
                    severity
            );

            event.setTriggeredAt(
                    LocalDateTime.now()
            );

            event.setIsVerified(
                    true
            );

            event.setDataSource(
                    "AQI_API"
            );

            eventRepository.save(event);

            System.out.println(
                    "SEVERE_AQI disruption event created"
            );

        } else {

            /*
             * =================================================
             * 8. AQI returned to normal
             *
             * Close any active SEVERE_AQI event.
             * =================================================
             */

            Optional<DisruptionEvent> activeEvent =
                    eventRepository
                            .findFirstByZoneIdAndEventTypeAndEndedAtIsNull(
                                    zoneId,
                                    EventType.SEVERE_AQI
                            );

            if (activeEvent.isPresent()) {

                DisruptionEvent event =
                        activeEvent.get();

                event.setEndedAt(
                        LocalDateTime.now()
                );

                eventRepository.save(event);

                System.out.println(
                        "SEVERE_AQI disruption event closed"
                );

            } else {

                System.out.println(
                        "No active SEVERE_AQI event to close"
                );
            }
        }
    }
}