package com.gigshield.backend.model;

import com.gigshield.backend.model.enums.PolicyStatus;
import com.gigshield.backend.model.enums.PolicyTier;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "policies")
@Data
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    @Enumerated(EnumType.STRING)
    private PolicyTier tier;

    private double basePremium;
    private double actualPremium;

    private double maxDailyPayout;
    private double maxWeeklyPayout;

    private LocalDate coverageStart;
    private LocalDate coverageEnd;

    @Enumerated(EnumType.STRING)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    private boolean autoRenew = true;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getWorker() {
        return worker;
    }

    public void setWorker(User worker) {
        this.worker = worker;
    }

    public PolicyTier getTier() {
        return tier;
    }

    public void setTier(PolicyTier tier) {
        this.tier = tier;
    }

    public double getBasePremium() {
        return basePremium;
    }

    public void setBasePremium(double basePremium) {
        this.basePremium = basePremium;
    }

    public double getActualPremium() {
        return actualPremium;
    }

    public void setActualPremium(double actualPremium) {
        this.actualPremium = actualPremium;
    }

    public double getMaxDailyPayout() {
        return maxDailyPayout;
    }

    public void setMaxDailyPayout(double maxDailyPayout) {
        this.maxDailyPayout = maxDailyPayout;
    }

    public double getMaxWeeklyPayout() {
        return maxWeeklyPayout;
    }

    public void setMaxWeeklyPayout(double maxWeeklyPayout) {
        this.maxWeeklyPayout = maxWeeklyPayout;
    }

    public LocalDate getCoverageStart() {
        return coverageStart;
    }

    public void setCoverageStart(LocalDate coverageStart) {
        this.coverageStart = coverageStart;
    }

    public LocalDate getCoverageEnd() {
        return coverageEnd;
    }

    public void setCoverageEnd(LocalDate coverageEnd) {
        this.coverageEnd = coverageEnd;
    }

    public PolicyStatus getStatus() {
        return status;
    }

    public void setStatus(PolicyStatus status) {
        this.status = status;
    }

    public boolean isAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(boolean autoRenew) {
        this.autoRenew = autoRenew;
    }
}