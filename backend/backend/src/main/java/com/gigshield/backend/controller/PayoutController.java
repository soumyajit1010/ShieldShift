package com.gigshield.backend.controller;

import com.gigshield.backend.dto.response.PayoutResponse;
import com.gigshield.backend.service.PayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payouts")
public class PayoutController {

    @Autowired
    private PayoutService payoutService;

    @GetMapping("/worker/{workerId}")
    public List<PayoutResponse> getWorkerPayouts(
            @PathVariable Long workerId) {

        return payoutService
                .getWorkerPayouts(workerId);
    }
}