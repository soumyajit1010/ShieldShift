package com.gigshield.backend.repository;

import com.gigshield.backend.model.Policy;
import com.gigshield.backend.model.User;
import com.gigshield.backend.model.enums.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {

    Optional<Policy> findByWorkerAndStatus(
            User worker,
            PolicyStatus status
    );

    Optional<Policy> findTopByWorkerIdOrderByIdDesc(
            Long workerId
    );

    Optional<Policy> findTopByWorkerIdAndStatusOrderByIdDesc(
            Long workerId,
            PolicyStatus status
    );

}