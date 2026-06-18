package com.gigshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_logs")
@Data
public class FraudLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long claimId;
    private Long workerId;

    private double fraudScore;

    @Column(columnDefinition = "JSON")
    private String flagsTriggered;

    private double gpsLat;
    private double gpsLng;

    private double distanceFromZoneKm;

    private boolean reviewed = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}

