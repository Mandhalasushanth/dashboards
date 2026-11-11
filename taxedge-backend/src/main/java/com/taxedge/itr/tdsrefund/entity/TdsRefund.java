package com.taxedge.itr.tdsrefund.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.tdsrefund.enums.AccountType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tds_refund")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TdsRefund {

	@Id
	@Column(name = "tds_refund_id", nullable = false, updatable = false, length = 20)
	private String id;

    @Column(name = "cust_id", nullable = false, length = 50)
    private String custId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", insertable = false, updatable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private AgentLogin assignedAgent;

    @Column(name = "account_holder_name", nullable = false, length = 100)
    private String accountHolderName;

    @Column(name = "account_number", nullable = false, length = 18)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 11)
    private String ifscCode;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "branch_name", length = 100)
    private String branchName;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, length = 10)
    private AccountType accountType;
    
    @Column(name = "legal_business_name", nullable = false, length = 100)
    private String legalBusinessName;

    @Column(name = "business_pan", nullable = false, length = 10)
    private String businessPan;

    @Column(name = "business_pan_document")
    private byte[] businessPanDocument;

    @Column(name = "aadhaar_number", nullable = false, length = 12)
    private String aadhaarNumber;

    @Column(name = "aadhaar_document")
    private byte[] aadhaarDocument;

    @Column(name = "mobile_number", nullable = false, length = 10)
    private String mobileNumber;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RegisterationStatus status = RegisterationStatus.DRAFT;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
