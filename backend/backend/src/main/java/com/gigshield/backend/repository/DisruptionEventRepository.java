package com.gigshield.backend.repository;

import com.gigshield.backend.model.DisruptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisruptionEventRepository
        extends JpaRepository<DisruptionEvent, Long> {
}