package com.gigshield.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClaimHistoryResponse {

    private Long claimId;

    private double payoutAmount;

    private double fraudScore;

    private String status;

    private LocalDateTime createdAt;
}