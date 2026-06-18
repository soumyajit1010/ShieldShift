package com.gigshield.backend.service;

import com.gigshield.backend.dto.request.PolicyRequest;
import com.gigshield.backend.dto.response.PolicyResponse;
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



    public PolicyResponse createPolicy(
            PolicyRequest request) {

        User worker = userRepository.findById(
                request.getWorkerId()
        ).orElseThrow(() ->
                new RuntimeException("Worker not found"));

        Policy policy = new Policy();

        policy.setWorker(worker);
        policy.setTier(request.getTier());

        assignPlanDetails(policy);

        policy.setCoverageStart(LocalDate.now());
        policy.setCoverageEnd(LocalDate.now().plusDays(7));

        policy.setStatus(PolicyStatus.ACTIVE);

        Policy savedPolicy =
                policyRepository.save(policy);

        return mapToResponse(savedPolicy);
    }

    private void assignPlanDetails(
            Policy policy) {

        PolicyTier tier = policy.getTier();

        switch (tier) {

            case BASIC:
                policy.setBasePremium(29);
                policy.setActualPremium(29);
                policy.setMaxDailyPayout(250);
                policy.setMaxWeeklyPayout(500);
                break;

            case STANDARD:
                policy.setBasePremium(59);
                policy.setActualPremium(59);
                policy.setMaxDailyPayout(500);
                policy.setMaxWeeklyPayout(1200);
                break;

            case PRO:
                policy.setBasePremium(99);
                policy.setActualPremium(99);
                policy.setMaxDailyPayout(900);
                policy.setMaxWeeklyPayout(2500);
                break;
        }
    }

    private PolicyResponse mapToResponse(
            Policy policy) {

        PolicyResponse response =
                new PolicyResponse();

        response.setPolicyId(policy.getId());

        response.setTier(
                policy.getTier().name());

        response.setPremium(
                policy.getActualPremium());

        response.setMaxDailyPayout(
                policy.getMaxDailyPayout());

        response.setMaxWeeklyPayout(
                policy.getMaxWeeklyPayout());

        response.setStatus(
                policy.getStatus().name());

        return response;
    }

    public PolicyResponse getWorkerPolicy(
            Long workerId) {

        Policy policy = policyRepository
                .findTopByWorkerIdOrderByIdDesc(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Policy not found"));

        return mapToResponse(policy);
    }
}