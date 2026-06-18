package com.gigshield.backend.dto.request;

import com.gigshield.backend.model.enums.Platform;
import lombok.Data;


@Data
public class RegisterRequest {

    private String mobileNumber;
    private String fullName;
    private String city;
    private Long zoneId;
    private Platform platform;
    private String upiId;

    private double avgDailyHours;
    private double avgHourlyIncome;


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

    public Long getZoneId() {
        return zoneId;
    }

    public void setZoneId(Long zoneId) {
        this.zoneId = zoneId;
    }

    public Platform getPlatform() {
        return platform;
    }

    public void setPlatform(Platform platform) {
        this.platform = platform;
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
}