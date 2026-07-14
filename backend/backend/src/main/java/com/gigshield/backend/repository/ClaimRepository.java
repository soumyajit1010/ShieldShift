package com.gigshield.backend.repository;

import com.gigshield.backend.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClaimRepository
        extends JpaRepository<Claim, Long> {

    List<Claim> findByWorkerId(Long workerId);


    long countByWorkerId(Long workerId);

    @Query("""
    SELECT COALESCE(SUM(p.amount),0)
    FROM Payout p
    WHERE p.claim.worker.id = :workerId
    """)
    Double getTotalPayout(
            @Param("workerId") Long workerId
    );

}