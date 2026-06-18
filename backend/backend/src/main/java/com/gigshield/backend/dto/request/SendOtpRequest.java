package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String mobileNumber;

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }
}