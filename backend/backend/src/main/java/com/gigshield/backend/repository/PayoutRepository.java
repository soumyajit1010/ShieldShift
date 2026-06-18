package com.gigshield.backend.repository;

import com.gigshield.backend.model.Payout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayoutRepository
        extends JpaRepository<Payout, Long> {

    List<Payout> findByWorkerId(Long workerId);
}