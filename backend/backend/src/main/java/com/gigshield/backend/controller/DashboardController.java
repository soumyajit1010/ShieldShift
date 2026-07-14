package com.gigshield.backend.controller;

import com.gigshield.backend.dto.response.DashboardResponse;
import com.gigshield.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/{workerId}")
    public DashboardResponse getDashboard(
            @PathVariable Long workerId) {

        return dashboardService.getDashboard(workerId);

    }

}