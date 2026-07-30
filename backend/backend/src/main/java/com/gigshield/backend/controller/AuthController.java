package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.SendOtpRequest;
import com.gigshield.backend.dto.request.VerifyOtpRequest;
import com.gigshield.backend.dto.response.OtpVerificationResponse;
import com.gigshield.backend.model.User;
import com.gigshield.backend.repository.UserRepository;
import com.gigshield.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/send-otp")
    public Map<String, String> sendOtp(@RequestBody SendOtpRequest request) {
        String msg = otpService.sendOtp(request.getMobileNumber());
        return Map.of("message", msg);
    }

    @PostMapping("/verify-otp")
    public OtpVerificationResponse verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        boolean isValid = otpService.verifyOtp(
                request.getMobileNumber(),
                request.getOtp()
        );

        OtpVerificationResponse response =
                new OtpVerificationResponse();

        if (!isValid) {
            response.setMessage("Invalid OTP");
            response.setRegistered(false);
            return response;
        }

        Optional<User> user =
                userRepository.findByMobileNumber(
                        request.getMobileNumber());

        response.setMessage("OTP verified");
        response.setRegistered(user.isPresent());
        user.ifPresent(response::setUser);

        return response;
    }

    /**
     * Demo signup: verifies OTP and returns a temp session payload.
     * Full worker profile is created later via /api/users/register.
     */
    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, String> body) {
        String mobileNumber = body.getOrDefault("phone", body.get("mobileNumber"));
        String otp = body.get("otp");
        String name = body.getOrDefault("name", body.get("fullName"));

        boolean isValid = otpService.verifyOtp(mobileNumber, otp);
        if (!isValid) {
            return Map.of(
                    "error", "Invalid OTP",
                    "token", "",
                    "user", Map.of()
            );
        }

        Optional<User> existing = userRepository.findByMobileNumber(mobileNumber);
        if (existing.isPresent()) {
            return Map.of(
                    "token", "temp-token",
                    "user", existing.get()
            );
        }

        return Map.of(
                "token", "temp-token",
                "user", Map.of(
                        "mobileNumber", mobileNumber,
                        "fullName", name != null ? name : ""
                )
        );
    }
}
