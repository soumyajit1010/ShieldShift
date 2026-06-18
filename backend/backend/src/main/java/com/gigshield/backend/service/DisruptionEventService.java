package com.gigshield.backend.service;

import com.gigshield.backend.dto.request.DisruptionEventRequest;
import com.gigshield.backend.dto.response.DisruptionEventResponse;
import com.gigshield.backend.model.DisruptionEvent;
import com.gigshield.backend.model.Zone;
import com.gigshield.backend.repository.DisruptionEventRepository;
import com.gigshield.backend.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DisruptionEventService {

    @Autowired
    private DisruptionEventRepository eventRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    public DisruptionEventResponse createEvent(
            DisruptionEventRequest request) {

        Zone zone = zoneRepository.findById(
                request.getZoneId())
                .orElseThrow(() ->
                        new RuntimeException("Zone not found"));

        DisruptionEvent event = new DisruptionEvent();

        event.setEventType(
                request.getEventType());

        event.setZone(zone);

        event.setSeverityValue(
                request.getSeverityValue());

        event.setTriggeredAt(
                LocalDateTime.now());

        DisruptionEvent savedEvent =
                eventRepository.save(event);

        return mapToResponse(savedEvent);
    }

    public List<DisruptionEventResponse> getAllEvents() {

        return eventRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DisruptionEventResponse getEventById(
            Long eventId) {

        DisruptionEvent event =
                eventRepository.findById(eventId)
                        .orElseThrow(() ->
                                new RuntimeException("Event not found"));

        return mapToResponse(event);
    }

    private DisruptionEventResponse mapToResponse(
            DisruptionEvent event) {

        DisruptionEventResponse response =
                new DisruptionEventResponse();

        response.setId(event.getId());

        response.setEventType(
                event.getEventType().name());

        response.setZoneName(
                event.getZone().getName());

        response.setSeverityValue(
                event.getSeverityValue());

        response.setTriggeredAt(
                event.getTriggeredAt());

        return response;
    }
}