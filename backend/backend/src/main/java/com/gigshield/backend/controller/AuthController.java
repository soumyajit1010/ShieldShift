package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.SendOtpRequest;
import com.gigshield.backend.dto.request.VerifyOtpRequest;
import com.gigshield.backend.dto.response.OtpVerificationResponse;
import com.gigshield.backend.model.User;
import com.gigshield.backend.repository.UserRepository;
import com.gigshield.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.gigshield.backend.dto.response.OtpVerificationResponse;
import com.gigshield.backend.model.User;
import com.gigshield.backend.repository.UserRepository;

import java.util.Optional;

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
}