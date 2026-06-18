package com.gigshield.backend.dto.response;

import lombok.Data;

@Data
public class PayoutResponse {

    private Long payoutId;

    private Long claimId;

    private Double amount;

    private String upiId;

    private String status;
}