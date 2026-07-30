package com.gigshield.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class OtpService {

    private Map<String, String> otpStore = new HashMap<>();

    private static final String DEMO_OTP = "1234";

    // Generate and store OTP
    public String sendOtp(String mobileNumber) {
        // Demo mode: always use 1234 so the UI hint matches
        String otp = DEMO_OTP;
        otpStore.put(mobileNumber, otp);

        System.out.println("OTP for " + mobileNumber + " = " + otp); // mock

        return "OTP sent successfully";
    }

    // Verify OTP
    public boolean verifyOtp(String mobileNumber, String otp) {
        if (DEMO_OTP.equals(otp)) {
            return true;
        }
        return otp.equals(otpStore.get(mobileNumber));
    }


}
