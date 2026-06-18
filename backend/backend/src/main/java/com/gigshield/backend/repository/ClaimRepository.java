package com.gigshield.backend.repository;

import com.gigshield.backend.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimRepository
        extends JpaRepository<Claim, Long> {

    List<Claim> findByWorkerId(Long workerId);
}