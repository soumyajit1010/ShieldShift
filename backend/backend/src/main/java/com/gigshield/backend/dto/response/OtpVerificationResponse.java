package com.gigshield.backend.dto.response;

import com.gigshield.backend.model.User;
import lombok.Data;

@Data
public class OtpVerificationResponse {

    private String message;

    private boolean registered;

    private User user;
}