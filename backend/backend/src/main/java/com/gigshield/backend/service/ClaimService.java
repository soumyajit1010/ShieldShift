package com.gigshield.backend.service;


import com.gigshield.backend.dto.request.ClaimRequest;
import com.gigshield.backend.dto.response.*;
import com.gigshield.backend.integration.MLClient;
import com.gigshield.backend.model.*;
import com.gigshield.backend.model.enums.ClaimStatus;
import com.gigshield.backend.repository.*;
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


        /*
         * 1. Fetch database entities
         */

        User worker =
                userRepository.findById(
                                request.getWorkerId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                ));


        Policy policy =
                policyRepository.findById(
                                request.getPolicyId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Policy not found"
                                ));


        DisruptionEvent event =
                eventRepository.findById(
                                request.getEventId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Event not found"
                                ));



        /*
         * 2. Validate ML requests
         */

        if(request.getSeverityRequest()==null ||
                request.getLossRequest()==null ||
                request.getFraudRequest()==null){

            throw new RuntimeException(
                    "ML request data missing"
            );
        }



        /*
         * 3. Call ML Service
         */

        SeverityResponse severityResponse =
                mlClient.getSeverity(
                        request.getSeverityRequest()
                );


        LossResponse lossResponse =
                mlClient.getLoss(
                        request.getLossRequest()
                );


        FraudResponse fraudResponse =
                mlClient.getFraud(
                        request.getFraudRequest()
                );



        /*
         * 4. Calculate payout dynamically
         */

        double estimatedLoss =
                lossResponse.getEstimated_loss_inr();


        double payoutModifier =
                severityResponse.getPayout_modifier();


        double payout =
                estimatedLoss * payoutModifier;



        /*
         * 5. Fraud decision
         */

        ClaimStatus status;


        if(fraudResponse.getFraud_score() >= 0.8){

            status = ClaimStatus.REJECTED;

        }
        else{

            status = ClaimStatus.AUTO_APPROVED;

        }



        /*
         * 6. Save claim
         */


        Claim claim = new Claim();


        claim.setWorker(worker);

        claim.setPolicy(policy);

        claim.setDisruptionEvent(event);


        claim.setPayoutAmount(
                payout
        );


        claim.setFraudScore(
                fraudResponse.getFraud_score()
        );


        claim.setStatus(status);



        if(status == ClaimStatus.REJECTED){

            claim.setRejectionReason(
                    "High fraud score"
            );

        }



        Claim savedClaim =
                claimRepository.save(claim);



        /*
         * 7. Create payout
         */


        if(status == ClaimStatus.AUTO_APPROVED){

            payoutService.createPayout(
                    savedClaim,
                    worker,
                    payout
            );

        }



        /*
         * 8. Send response
         */


        ClaimResponse response =
                new ClaimResponse();



        response.setClaimId(
                savedClaim.getId()
        );


        response.setSeverityClass(
                severityResponse.getSeverity_class()
        );


        response.setEstimatedLoss(
                estimatedLoss
        );


        response.setFraudScore(
                fraudResponse.getFraud_score()
        );


        response.setFraudDecision(
                fraudResponse.getDecision()
        );


        response.setPayoutAmount(
                payout
        );


        response.setClaimStatus(
                status.name()
        );


        return response;

    }





    public List<ClaimHistoryResponse> getWorkerClaims(
            Long workerId) {


        List<Claim> claims =
                claimRepository.findByWorkerId(workerId);


        return claims.stream()
                .map(this::mapToHistoryResponse)
                .toList();

    }





    private ClaimHistoryResponse mapToHistoryResponse(
            Claim claim) {


        ClaimHistoryResponse response =
                new ClaimHistoryResponse();


        response.setClaimId(
                claim.getId()
        );


        response.setEvent(
                claim.getDisruptionEvent()
                        .getEventType()
                        .name()
        );


        response.setClaimDate(
                claim.getCreatedAt()
        );


        response.setClaimStatus(
                claim.getStatus()
                        .name()
        );


        response.setPayoutAmount(
                claim.getPayoutAmount()
        );


        response.setFraudScore(
                claim.getFraudScore()
        );


        return response;

    }

}