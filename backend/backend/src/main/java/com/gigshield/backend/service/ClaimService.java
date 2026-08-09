package com.gigshield.backend.service;


import com.gigshield.backend.dto.request.*;
import com.gigshield.backend.dto.response.*;
import com.gigshield.backend.integration.MLClient;
import com.gigshield.backend.model.*;
import com.gigshield.backend.model.enums.ClaimStatus;
import com.gigshield.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
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
            ClaimRequest request,
            MultipartFile image
    ) {


        /*
         * =====================================================
         * 1. Fetch database entities
         * =====================================================
         */

        User worker =
                userRepository.findById(request.getWorkerId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                ));


        Policy policy =
                policyRepository.findById(request.getPolicyId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Policy not found"
                                ));


        DisruptionEvent event =
                eventRepository.findById(request.getEventId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Event not found"
                                ));





        /*
         * =====================================================
         * 2. Prepare ML requests
         * =====================================================
         */

        SeverityRequest severityRequest =
                request.getSeverityRequest() != null
                        ? request.getSeverityRequest()
                        : buildSeverityRequest(event);



        LossRequest lossRequest =
                request.getLossRequest() != null
                        ? request.getLossRequest()
                        : buildLossRequest(worker,event);



        FraudRequest fraudRequest =
                request.getFraudRequest() != null
                        ? request.getFraudRequest()
                        : buildFraudRequest(worker);







        /*
         * =====================================================
         * 3. Run existing AI models
         *
         * Severity
         * Loss
         * Fraud
         * =====================================================
         */


        SeverityResponse severityResponse =
                mlClient.getSeverity(
                        severityRequest
                );



        if(request.getLossRequest()==null){

            lossRequest.setSeverity_class(
                    severityResponse.getSeverity_class()
            );

        }



        LossResponse lossResponse =
                mlClient.getLoss(
                        lossRequest
                );



        FraudResponse fraudResponse =
                mlClient.getFraud(
                        fraudRequest
                );







        /*
         * =====================================================
         * 4. Image ML Integration
         *
         * User uploads road image
         *
         * Spring Boot
         *        |
         *        ↓
         * Flask
         *        |
         *        ↓
         * Road_clear / Road_block
         *
         * =====================================================
         */


        ImagePredictionResponse imageResponse = null;



        if(image != null && !image.isEmpty()) {


            try {


                imageResponse =
                        mlClient.getRoadPrediction(
                                image
                        );


            }
            catch(Exception e) {


                System.out.println(
                        "Image ML failed : "
                                + e.getMessage()
                );

            }

        }







        /*
         * =====================================================
         * 5. Image based severity adjustment
         *
         * If:
         *
         * Road_block = true
         * Confidence > 90%
         *
         * Then:
         *
         * Severity becomes HIGH
         *
         * =====================================================
         */


        if(imageResponse != null
                &&
                imageResponse.getData() != null) {



            boolean blocked =
                    imageResponse
                            .getData()
                            .isBlocked();



            double confidence =
                    imageResponse
                            .getData()
                            .getConfidence();



            if(blocked && confidence > 0.90) {



                System.out.println(
                        "Image confirms road blockage. Increasing severity."
                );



                severityResponse.setSeverity_class(
                        "HIGH"
                );

            }

        }







        /*
         * =====================================================
         * 6. Calculate payout
         *
         * IMPORTANT:
         * This happens AFTER image adjustment
         *
         * =====================================================
         */


        double estimatedLoss =
                lossResponse.getEstimated_loss_inr();



        double payoutModifier =
                severityResponse.getPayout_modifier();



        double payout =
                estimatedLoss * payoutModifier;







        /*
         * =====================================================
         * 7. Fraud decision
         * =====================================================
         */


        ClaimStatus status;



        if(fraudResponse.getFraud_score() >= 0.8) {


            status =
                    ClaimStatus.REJECTED;


        }
        else {


            status =
                    ClaimStatus.AUTO_APPROVED;

        }







        /*
         * =====================================================
         * 8. Save claim
         * =====================================================
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


        claim.setStatus(
                status
        );



        if(status == ClaimStatus.REJECTED) {


            claim.setRejectionReason(
                    "High fraud score"
            );

        }



        Claim savedClaim =
                claimRepository.save(claim);







        /*
         * =====================================================
         * 9. Create payout
         * =====================================================
         */


        if(status == ClaimStatus.AUTO_APPROVED) {


            payoutService.createPayout(
                    savedClaim,
                    worker,
                    payout
            );

        }







        /*
         * =====================================================
         * 10. Build response
         * =====================================================
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







        /*
         * =====================================================
         * 11. Add image result to response
         * =====================================================
         */


        if(imageResponse != null
                &&
                imageResponse.getData() != null) {



            response.setRoadPrediction(
                    imageResponse
                            .getData()
                            .getPrediction()
            );



            response.setImageConfidence(
                    imageResponse
                            .getData()
                            .getConfidence()
            );



            response.setRoadBlocked(
                    imageResponse
                            .getData()
                            .isBlocked()
            );

        }





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




    private SeverityRequest buildSeverityRequest(DisruptionEvent event) {
        SeverityRequest request = new SeverityRequest();
        request.setDisruption_type(event.getEventType().name());
        request.setSeverity_value(event.getSeverityValue());
        request.setDuration_hours(resolveDurationHours(event));
        request.setZone_risk_tier(2);
        request.setTime_of_day(LocalDateTime.now().getHour());
        request.setHistorical_avg_severity(event.getSeverityValue());
        return request;
    }

    private LossRequest buildLossRequest(User worker, DisruptionEvent event) {
        LossRequest request = new LossRequest();
        request.setDisruption_type(event.getEventType().name());
        request.setSeverity_class("MEDIUM");
        request.setDuration_hours(resolveDurationHours(event));
        request.setWorker_avg_hourly_income(
                worker.getAvgHourlyIncome() > 0
                        ? worker.getAvgHourlyIncome()
                        : 150.0
        );
        request.setZone_risk_tier(2);
        request.setTime_of_day(LocalDateTime.now().getHour());
        return request;
    }

    private FraudRequest buildFraudRequest(User worker) {
        FraudRequest request = new FraudRequest();
        request.setWorker_id(worker.getId().intValue());
        request.setDistance_to_zone_km(0.5);
        request.setPlatform_status("ONLINE");
        request.setClaim_frequency_30d(
                (int) claimRepository.findByWorkerId(worker.getId()).stream().count()
        );
        request.setAvg_claim_amount_30d(0.0);
        request.setHours_since_last_claim(72);
        request.setDevice_id_match(true);
        request.setGps_trajectory_score(0.9);
        request.setEvent_cluster_count(1);
        return request;
    }

    private double resolveDurationHours(DisruptionEvent event) {
        if (event.getTriggeredAt() != null && event.getEndedAt() != null) {
            long minutes = Duration.between(
                    event.getTriggeredAt(),
                    event.getEndedAt()
            ).toMinutes();
            return Math.max(1.0, minutes / 60.0);
        }
        return 2.0;
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
