package com.gigshield.backend.service;

import com.gigshield.backend.dto.request.RegisterRequest;
import com.gigshield.backend.model.User;
import com.gigshield.backend.model.Zone;
import com.gigshield.backend.repository.UserRepository;
import com.gigshield.backend.repository.ZoneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ZoneRepository zoneRepository;

    public User registerUser(RegisterRequest request) {

        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new RuntimeException("Zone not found"));

        User user = new User();

        user.setMobileNumber(request.getMobileNumber());
        user.setFullName(request.getFullName());
        user.setCity(request.getCity());
        user.setZone(zone);
        user.setPlatform(request.getPlatform());
        user.setUpiId(request.getUpiId());

        user.setAvgDailyHours(request.getAvgDailyHours());
        user.setAvgHourlyIncome(request.getAvgHourlyIncome());

        return userRepository.save(user);
    }
}