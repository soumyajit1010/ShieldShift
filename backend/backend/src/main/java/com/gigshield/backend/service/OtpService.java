package com.gigshield.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OtpService {

    private Map<String, String> otpStore = new HashMap<>();

    // Generate and store OTP
    public String sendOtp(String mobileNumber) {
        String otp = String.valueOf(new Random().nextInt(9000) + 1000);
        otpStore.put(mobileNumber, otp);

        System.out.println("OTP for " + mobileNumber + " = " + otp); // mock

        return "OTP sent successfully";
    }

    // Verify OTP
    public boolean verifyOtp(String mobileNumber, String otp) {
        return otp.equals(otpStore.get(mobileNumber));
    }
}