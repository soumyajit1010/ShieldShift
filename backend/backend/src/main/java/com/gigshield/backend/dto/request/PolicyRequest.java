package com.gigshield.backend.dto.request;

import com.gigshield.backend.model.enums.PolicyTier;
import lombok.Data;

@Data
public class PolicyRequest {

    private Long workerId;

    private PolicyTier tier;




    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public PolicyTier getTier() {
        return tier;
    }

    public void setTier(PolicyTier tier) {
        this.tier = tier;
    }
}