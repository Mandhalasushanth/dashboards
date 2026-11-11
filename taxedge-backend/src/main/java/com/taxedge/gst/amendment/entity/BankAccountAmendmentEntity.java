package com.taxedge.gst.amendment.entity;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.gst.registration.enums.AccountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_account_amendments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountAmendmentEntity {

    @Id
    @Column(name = "id", length = 30, nullable = false, unique = true)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private AgentLogin assignedAgent;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "new_bank_name", nullable = false)
    private String newBankName;

    @Column(name = "new_bank_account_number", nullable = false)
    private String newBankAccountNumber;

    @Column(name = "new_ifsc_code", nullable = false)
    private String newIfscCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_account_type", nullable = false)
    private AccountType newAccountType;

    @Column(name = "image_data")
    private byte[] imageData;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private com.taxedge.gst.registration.enums.RegisterationStatus status = com.taxedge.gst.registration.enums.RegisterationStatus.DRAFT;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
