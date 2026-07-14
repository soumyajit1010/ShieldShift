package com.gigshield.backend.service;

import com.gigshield.backend.dto.response.DashboardResponse;
import com.gigshield.backend.model.Policy;
import com.gigshield.backend.model.enums.PolicyStatus;
import com.gigshield.backend.repository.ClaimRepository;
import com.gigshield.backend.repository.PolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private PolicyRepository policyRepository;

    public DashboardResponse getDashboard(Long workerId) {

        DashboardResponse response = new DashboardResponse();

        response.setClaimCount(
                claimRepository.countByWorkerId(workerId)
        );

        Double total = claimRepository.getTotalPayout(workerId);

        response.setTotalPayout(
                total == null ? 0 : total
        );

        Policy policy = policyRepository
                .findTopByWorkerIdAndStatusOrderByIdDesc(
                        workerId,
                        PolicyStatus.ACTIVE
                )
                .orElse(null);

        if (policy != null) {

            response.setPolicyTier(
                    policy.getTier().name()
            );

            response.setCoverageStatus(
                    policy.getStatus().name()
            );

        }

        response.setWeeklyCoverage(
                policy.getMaxWeeklyPayout());

        response.setDailyCoverage(
                policy.getMaxDailyPayout());

        response.setCoverageStart(
                policy.getCoverageStart());

        response.setCoverageEnd(
                policy.getCoverageEnd());

        return response;
    }
}