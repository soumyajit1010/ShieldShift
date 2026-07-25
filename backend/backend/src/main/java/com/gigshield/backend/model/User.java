package com.gigshield.backend.model;

import com.gigshield.backend.model.enums.Platform;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mobileNumber;
    private String fullName;
    private String city;

    @ManyToOne
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @Enumerated(EnumType.STRING)
    private Platform platform;

    private String platformPartnerId;
    private String upiId;

    private double avgDailyHours;
    private double avgHourlyIncome;

    private boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();

}