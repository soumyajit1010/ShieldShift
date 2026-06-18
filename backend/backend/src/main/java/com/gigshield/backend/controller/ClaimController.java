package com.gigshield.backend.controller;

import com.gigshield.backend.dto.request.ClaimRequest;
import com.gigshield.backend.dto.response.ClaimResponse;
import com.gigshield.backend.model.Claim;
import com.gigshield.backend.service.ClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {

    @Autowired
    private ClaimService claimService;

    @PostMapping("/process")
    public ClaimResponse processClaim(
            @RequestBody ClaimRequest request) {

        return claimService.processClaim(
                request);
    }

    @GetMapping("/worker/{workerId}")
    public List<Claim> getWorkerClaims(
            @PathVariable Long workerId) {

        return claimService.getWorkerClaims(
                workerId);
    }
}