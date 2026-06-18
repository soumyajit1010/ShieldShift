package com.gigshield.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DisruptionEventResponse {

    private Long id;

    private String eventType;

    private String zoneName;

    private double severityValue;

    private LocalDateTime triggeredAt;
}