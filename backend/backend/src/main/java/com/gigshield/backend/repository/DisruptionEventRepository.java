package com.gigshield.backend.repository;

import com.gigshield.backend.model.DisruptionEvent;
import com.gigshield.backend.model.enums.EventType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisruptionEventRepository
        extends JpaRepository<DisruptionEvent, Long> {

    boolean existsByZoneIdAndEventTypeAndEndedAtIsNull(
            Long zoneId,
            EventType eventType
    );

}