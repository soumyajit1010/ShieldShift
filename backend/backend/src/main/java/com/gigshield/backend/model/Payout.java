package com.gigshield.backend.model;

import com.gigshield.backend.model.enums.PayoutStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "payouts")
@Data
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "claim_id")
    private Claim claim;

    @ManyToOne
    @JoinColumn(name = "worker_id")
    private User worker;

    private double amount;
    private String upiId;
    private String razorpayTxnId;

    @Enumerated(EnumType.STRING)
    private PayoutStatus status;

    private LocalDateTime initiatedAt = LocalDateTime.now();
    private LocalDateTime completedAt;
}