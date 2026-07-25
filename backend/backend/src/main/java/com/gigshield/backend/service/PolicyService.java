package com.gigshield.backend.service;


import com.gigshield.backend.dto.request.PolicyRequest;
import com.gigshield.backend.dto.request.PremiumRequest;
import com.gigshield.backend.dto.response.PolicyResponse;
import com.gigshield.backend.dto.response.PremiumResponse;
import com.gigshield.backend.integration.MLClient;
import com.gigshield.backend.model.Policy;
import com.gigshield.backend.model.User;
import com.gigshield.backend.model.enums.PolicyStatus;
import com.gigshield.backend.model.enums.PolicyTier;
import com.gigshield.backend.repository.PolicyRepository;
import com.gigshield.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;


@Service
public class PolicyService {


    @Autowired
    private PolicyRepository policyRepository;


    @Autowired
    private UserRepository userRepository;


    @Autowired
    private MLClient mlClient;



    public PolicyResponse createPolicy(
            PolicyRequest request) {


        /*
         * 1. Fetch worker
         */

        User worker =
                userRepository.findById(
                                request.getWorkerId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Worker not found"
                                ));



        /*
         * 2. Create policy object
         */

        Policy policy =
                new Policy();


        policy.setWorker(worker);

        policy.setTier(
                request.getTier()
        );



        /*
         * 3. Build ML Premium Request
         */

        PremiumRequest premiumRequest =
                buildPremiumRequest(
                        worker,
                        request.getTier()
                );



        /*
         * 4. Call AI Model
         */

        PremiumResponse premiumResponse =
                mlClient.predictPremium(
                        premiumRequest
                );



        if(premiumResponse == null ||
                premiumResponse.getData() == null){

            throw new RuntimeException(
                    "Premium prediction failed"
            );
        }



        double aiPremium = Math.round(
                premiumResponse.getData().getFinal_price() * 100.0
        ) / 100.0;



        /*
         * 5. Assign AI premium
         */

        assignPlanDetails(
                policy,
                aiPremium
        );



        /*
         * 6. Policy duration
         */

        policy.setCoverageStart(
                LocalDate.now()
        );


        policy.setCoverageEnd(
                LocalDate.now()
                        .plusDays(7)
        );


        policy.setStatus(
                PolicyStatus.ACTIVE
        );



        /*
         * 7. Save
         */

        Policy savedPolicy =
                policyRepository.save(policy);



        return mapToResponse(
                savedPolicy
        );

    }





    private PremiumRequest buildPremiumRequest(
            User worker,
            PolicyTier tier) {


        PremiumRequest request =
                new PremiumRequest();



        /*
         * Map GigShield tier
         * to ML model plan
         */

        String mlPlan;


        switch(tier){


            case BASIC:

                mlPlan = "SAATHI";
                break;


            case STANDARD:

                mlPlan = "RAKSHAK";
                break;


            case PRO:

                mlPlan = "SURAKSHA";
                break;


            default:

                mlPlan = "RAKSHAK";

        }



        request.setPlan(
                mlPlan
        );



        /*
         * Zone risk
         */

        if(worker.getZone()!=null){

            request.setRisk_zone(
                    mapZoneToRisk(worker.getZone().getName())
            );

        }
        else{

            request.setRisk_zone(
                    "MODERATE"
            );

        }




        /*
         * Worker history
         *
         * Later connect with claims table
         */

        request.setClaim_history(
                0
        );


        request.setPolicy_year(
                1
        );


        request.setHeat_addon(
                0
        );



        /*
         * Income calculation
         */

        double monthlyIncome =
                worker.getAvgHourlyIncome()
                        *
                        worker.getAvgDailyHours()
                        *
                        30;



        request.setMonthly_earnings(
                monthlyIncome
        );



        request.setDaily_hours(
                worker.getAvgDailyHours()
        );



        /*
         * Vehicle type
         *
         * Currently unavailable
         */

        request.setVehicle_type(
                "two_wheeler"
        );



        /*
         * Platform
         */

        if(worker.getPlatform()!=null){

            request.setPlatform(
                    worker.getPlatform()
                            .name()
            );

        }
        else{

            request.setPlatform(
                    "Zomato"
            );

        }



        /*
         * Historical disruption
         *
         * Later connect with disruption_events
         */

        request.setDisruption_days_hist(
                5
        );



        return request;

    }

    private String mapZoneToRisk(String zoneName) {

        if (zoneName == null) {
            return "MODERATE";
        }

        switch (zoneName.trim().toUpperCase()) {

            case "WHITEFIELD":
                return "HIGH";

            case "KORAMANGALA":
                return "MODERATE";

            case "INDIRANAGAR":
                return "SAFE";

            default:
                return "MODERATE";
        }
    }






    private void assignPlanDetails(
            Policy policy,
            double aiPremium) {



        switch(policy.getTier()){


            case BASIC:


                policy.setBasePremium(
                        aiPremium
                );


                policy.setActualPremium(
                        aiPremium
                );


                policy.setMaxDailyPayout(
                        250
                );


                policy.setMaxWeeklyPayout(
                        500
                );


                break;




            case STANDARD:


                policy.setBasePremium(
                        aiPremium
                );


                policy.setActualPremium(
                        aiPremium
                );


                policy.setMaxDailyPayout(
                        500
                );


                policy.setMaxWeeklyPayout(
                        1200
                );


                break;




            case PRO:


                policy.setBasePremium(
                        aiPremium
                );


                policy.setActualPremium(
                        aiPremium
                );


                policy.setMaxDailyPayout(
                        900
                );


                policy.setMaxWeeklyPayout(
                        2500
                );


                break;

        }

    }







    private PolicyResponse mapToResponse(
            Policy policy) {


        PolicyResponse response =
                new PolicyResponse();



        response.setPolicyId(
                policy.getId()
        );


        response.setTier(
                policy.getTier()
                        .name()
        );


        response.setPremium(
                policy.getActualPremium()
        );


        response.setMaxDailyPayout(
                policy.getMaxDailyPayout()
        );


        response.setMaxWeeklyPayout(
                policy.getMaxWeeklyPayout()
        );


        response.setStatus(
                policy.getStatus()
                        .name()
        );


        response.setCoverageStart(
                policy.getCoverageStart()
        );


        response.setCoverageEnd(
                policy.getCoverageEnd()
        );


        return response;

    }






    public PolicyResponse getWorkerPolicy(
            Long workerId) {


        Policy policy =
                policyRepository
                        .findTopByWorkerIdOrderByIdDesc(
                                workerId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Policy not found"
                                ));



        return mapToResponse(
                policy
        );

    }

}