package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.DisruptionEventRequest;
import com.gigshield.backend.dto.response.DisruptionEventResponse;
import com.gigshield.backend.service.DisruptionEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class DisruptionEventController {

    @Autowired
    private DisruptionEventService eventService;

    @GetMapping("/test")
    public String test() {
        return "Event Controller Working";
    }

    @PostMapping("/create")
    public DisruptionEventResponse createEvent(
            @RequestBody DisruptionEventRequest request) {

        return eventService.createEvent(request);
    }

    @GetMapping
    public List<DisruptionEventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public DisruptionEventResponse getEventById(
            @PathVariable Long id) {

        return eventService.getEventById(id);
    }
}