package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.PolicyRequest;
import com.gigshield.backend.dto.response.PlanPriceResponse;
import com.gigshield.backend.dto.response.PolicyResponse;
import com.gigshield.backend.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @PostMapping("/create")
    public PolicyResponse createPolicy(
            @RequestBody PolicyRequest request) {

        return policyService.createPolicy(request);
    }

    @GetMapping("/worker/{workerId}")
    public PolicyResponse getWorkerPolicy(
            @PathVariable Long workerId) {

        return policyService.getWorkerPolicy(workerId);
    }

    @GetMapping("/prices/{workerId}")
    public List<PlanPriceResponse> getPlanPrices(
            @PathVariable Long workerId){

        return policyService.getPlanPrices(workerId);

    }
}