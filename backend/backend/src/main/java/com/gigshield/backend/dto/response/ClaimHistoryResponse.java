package com.gigshield.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ClaimHistoryResponse {

    private Long claimId;

    private String event;

    private LocalDateTime claimDate;

    private String claimStatus;

    private double payoutAmount;

    private double fraudScore;

}