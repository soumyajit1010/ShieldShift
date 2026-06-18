package com.gigshield.backend.service;

import com.gigshield.backend.dto.response.PayoutResponse;
import com.gigshield.backend.model.Claim;
import com.gigshield.backend.model.Payout;
import com.gigshield.backend.model.User;
import com.gigshield.backend.model.enums.PayoutStatus;
import com.gigshield.backend.repository.PayoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PayoutService {

    @Autowired
    private PayoutRepository payoutRepository;

    public Payout createPayout(
            Claim claim,
            User worker,
            double amount) {

        Payout payout = new Payout();

        payout.setClaim(claim);

        payout.setWorker(worker);

        payout.setAmount(amount);

        payout.setUpiId(worker.getUpiId());

        payout.setRazorpayTxnId(
                "TXN-" + System.currentTimeMillis());

        payout.setStatus(
                PayoutStatus.INITIATED);

        return payoutRepository.save(payout);
    }

    public List<PayoutResponse> getWorkerPayouts(
            Long workerId) {

        return payoutRepository
                .findByWorkerId(workerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PayoutResponse mapToResponse(
            Payout payout) {

        PayoutResponse response =
                new PayoutResponse();

        response.setPayoutId(
                payout.getId());

        response.setClaimId(
                payout.getClaim().getId());

        response.setAmount(
                payout.getAmount());

        response.setUpiId(
                payout.getUpiId());

        response.setStatus(
                payout.getStatus().name());

        return response;
    }
}