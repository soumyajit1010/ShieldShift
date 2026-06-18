package com.gigshield.backend.dto.request;

import com.gigshield.backend.model.enums.EventType;
import lombok.Data;

@Data
public class DisruptionEventRequest {

    private EventType eventType;

    private Long zoneId;

    private double severityValue;
}