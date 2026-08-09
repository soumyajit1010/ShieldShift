package com.gigshield.backend.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ClaimRequest {

    private Long workerId;

    private Long policyId;

    private Long eventId;

    private String description;

    private MultipartFile image;


    private SeverityRequest severityRequest;

    private LossRequest lossRequest;

    private FraudRequest fraudRequest;
}