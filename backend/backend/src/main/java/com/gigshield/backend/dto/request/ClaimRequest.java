package com.gigshield.backend.dto.request;

import lombok.Data;

@Data
public class ClaimRequest {

    private Long workerId;
    private Long policyId;
    private Long eventId;

    private SeverityRequest severityRequest;
    private LossRequest lossRequest;
    private FraudRequest fraudRequest;



}