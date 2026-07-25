package com.gigshield.backend.service;

import com.gigshield.backend.dto.request.DashboardRiskRequest;
import com.gigshield.backend.dto.response.DashboardResponse;
import com.gigshield.backend.dto.response.DashboardRiskResponse;
import com.gigshield.backend.integration.MLClient;
import com.gigshield.backend.model.Policy;
import com.gigshield.backend.model.User;
import com.gigshield.backend.model.enums.PolicyStatus;
import com.gigshield.backend.repository.ClaimRepository;
import com.gigshield.backend.repository.PolicyRepository;
import com.gigshield.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MLClient mlClient;

    public DashboardResponse getDashboard(Long workerId) {

        DashboardResponse response = new DashboardResponse();

        // ===============================
        // Dashboard Statistics
        // ===============================

        response.setClaimCount(
                claimRepository.countByWorkerId(workerId)
        );

        Double total = claimRepository.getTotalPayout(workerId);

        response.setTotalPayout(
                total == null ? 0 : total
        );

        // ===============================
        // Active Policy Details
        // ===============================

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

            response.setWeeklyCoverage(
                    policy.getMaxWeeklyPayout()
            );

            response.setDailyCoverage(
                    policy.getMaxDailyPayout()
            );

            response.setCoverageStart(
                    policy.getCoverageStart()
            );

            response.setCoverageEnd(
                    policy.getCoverageEnd()
            );
        }

        // ===============================
        // AI Risk Forecast
        // ===============================

        User worker = userRepository.findById(workerId)
                .orElseThrow(() ->
                        new RuntimeException("Worker not found"));

        DashboardRiskRequest request =
                new DashboardRiskRequest();

        request.setZone(
                worker.getZone().getName()
        );

        request.setPlatform(
                worker.getPlatform().name()
        );

        request.setAvgDailyHours(
                worker.getAvgDailyHours()
        );

        request.setAvgHourlyIncome(
                worker.getAvgHourlyIncome()
        );

        DashboardRiskResponse aiResponse =
                mlClient.getDashboardRisk(request);

        response.setOverallRiskScore(
                aiResponse.getOverallRiskScore()
        );

        response.setRainRisk(
                aiResponse.getRainRisk()
        );

        response.setHeatRisk(
                aiResponse.getHeatRisk()
        );

        response.setAqiRisk(
                aiResponse.getAqiRisk()
        );

        response.setBandhRisk(
                aiResponse.getBandhRisk()
        );

        response.setPredictedIncomeLoss(
                aiResponse.getPredictedIncomeLoss()
        );

        response.setForecastMessage(
                aiResponse.getForecastMessage()
        );

        return response;
    }
}