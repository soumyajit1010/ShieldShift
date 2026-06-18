package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.RegisterRequest;
import com.gigshield.backend.model.User;
import com.gigshield.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }
}