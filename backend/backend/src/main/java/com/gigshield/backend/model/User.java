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


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Zone getZone() {
        return zone;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }

    public Platform getPlatform() {
        return platform;
    }

    public void setPlatform(Platform platform) {
        this.platform = platform;
    }

    public String getPlatformPartnerId() {
        return platformPartnerId;
    }

    public void setPlatformPartnerId(String platformPartnerId) {
        this.platformPartnerId = platformPartnerId;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public double getAvgDailyHours() {
        return avgDailyHours;
    }

    public void setAvgDailyHours(double avgDailyHours) {
        this.avgDailyHours = avgDailyHours;
    }

    public double getAvgHourlyIncome() {
        return avgHourlyIncome;
    }

    public void setAvgHourlyIncome(double avgHourlyIncome) {
        this.avgHourlyIncome = avgHourlyIncome;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}