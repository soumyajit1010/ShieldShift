
package com.gigshield.backend.service;

import com.gigshield.backend.dto.request.ClaimRequest;
import com.gigshield.backend.dto.response.*;
import com.gigshield.backend.integration.MLClient;
import com.gigshield.backend.model.Claim;
import com.gigshield.backend.model.DisruptionEvent;
import com.gigshield.backend.model.Policy;
import com.gigshield.backend.model.User;
import com.gigshield.backend.model.enums.ClaimStatus;
import com.gigshield.backend.repository.ClaimRepository;
import com.gigshield.backend.repository.DisruptionEventRepository;
import com.gigshield.backend.repository.PolicyRepository;
import com.gigshield.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClaimService {

    @Autowired
    private MLClient mlClient;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private DisruptionEventRepository eventRepository;

    @Autowired
    private PayoutService payoutService;

    public ClaimResponse processClaim(
            ClaimRequest request) {

        // Fetch Worker
        User worker = userRepository.findById(
                        request.getWorkerId())
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        // Fetch Policy
        Policy policy = policyRepository.findById(
                        request.getPolicyId())
                .orElseThrow(() ->
                        new RuntimeException("Policy not found"));

        // Fetch Event
        DisruptionEvent event =
                eventRepository.findById(
                                request.getEventId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Event not found"));

        // Call ML APIs
//        SeverityResponse severity =
//                mlClient.getSeverity(
//                        request.getSeverityRequest());
//
//        LossResponse loss =
//                mlClient.getLoss(
//                        request.getLossRequest());
//
//        FraudResponse fraud =
//                mlClient.getFraud(
//                        request.getFraudRequest());

        String severity = "HIGH";

        double loss = 500;

        double fraud = 0.2;

        String fraudDecision = "LEGIT";

        double payout = 700;

        // Calculate payout
//        double payout =
//                loss.getEstimated_loss_inr()
//                        * severity.getPayout_modifier();

        // Decide claim status
        ClaimStatus status;

        if (fraud >= 0.8) {

            status = ClaimStatus.REJECTED;

        } else {

            status = ClaimStatus.AUTO_APPROVED;
        }

        // Create Claim
        Claim claim = new Claim();

        claim.setWorker(worker);
        claim.setPolicy(policy);
        claim.setDisruptionEvent(event);

        claim.setPayoutAmount(payout);

        claim.setFraudScore(
                fraud);

        claim.setStatus(status);

        if (status == ClaimStatus.REJECTED) {

            claim.setRejectionReason(
                    "High fraud score");
        }

        // Save Claim
        Claim savedClaim =
                claimRepository.save(claim);

        // Auto Create Payout
        if (status == ClaimStatus.AUTO_APPROVED) {

            payoutService.createPayout(
                    savedClaim,
                    worker,
                    payout);
        }

        // Response
        ClaimResponse response =
                new ClaimResponse();

        response.setClaimId(
                savedClaim.getId());

        response.setSeverityClass(
                severity);

        response.setEstimatedLoss(
                loss);

        response.setFraudScore(
                fraud);

        response.setFraudDecision(
                String.valueOf(fraud));

        response.setPayoutAmount(
                payout);

        response.setClaimStatus(
                status.name());

        return response;
    }

    public List<Claim> getWorkerClaims(
            Long workerId) {

        return claimRepository.findByWorkerId(
                workerId);
    }
}

