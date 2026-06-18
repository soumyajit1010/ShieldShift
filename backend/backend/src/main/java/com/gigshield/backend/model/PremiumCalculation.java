package com.gigshield.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "premium_calculations")
@Data
public class PremiumCalculation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long workerId;
    private LocalDate weekStartDate;

    private double basePremium;
    private double adjustment;
    private double finalPremium;

    @Column(columnDefinition = "JSON")
    private String factorsJson;

    private LocalDateTime calculatedAt = LocalDateTime.now();
}