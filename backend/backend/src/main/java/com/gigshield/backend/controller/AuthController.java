package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.SendOtpRequest;
import com.gigshield.backend.dto.request.VerifyOtpRequest;
import com.gigshield.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@RequestBody SendOtpRequest request) {
        String msg = otpService.sendOtp(request.getMobileNumber());
        return Map.of("message", msg);
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@RequestBody VerifyOtpRequest request) {

        boolean isValid = otpService.verifyOtp(
                request.getMobileNumber(),
                request.getOtp()
        );

        if (isValid) {
            return Map.of("message", "OTP verified");
        } else {
            return Map.of("message", "Invalid OTP");
        }
    }
}