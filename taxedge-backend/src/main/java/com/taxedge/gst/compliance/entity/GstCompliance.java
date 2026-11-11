package com.taxedge.gst.compliance.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.gst.compliance.enums.ComplianceRequestType;
import com.taxedge.gst.registration.enums.RegisterationStatus;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gst_compliance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstCompliance {

    @Id
    @Column(name = "compliance_id", nullable = false, unique = true)
    private String complinaceId;

    @Column(name = "gstin", nullable = false, length = 15)
    private String gstin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", nullable = false)
    private Customer customer;

    @Column(name = "financial_year", nullable = false, length = 7)
    private String financialYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 50)
    private ComplianceRequestType requestType;

    @Column(name = "gstr_2b_number", length = 50)
    private String gstr2bNumber;

    @Column(name = "reconciliation_file_1")
    private byte[] reconciliationFile1;

    @Column(name = "reconciliation_file_2")
    private byte[] reconciliationFile2;

    @Column(name = "notice_number", length = 100)
    private String noticeNumber;

    @Column(name = "notice_issue_date")
    private LocalDate noticeIssueDate;

    @Column(name = "reply_due_date")
    private LocalDate replyDueDate;

    @Column(name = "notice_file")
    private byte[] noticeFile;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private AgentLogin assignedAgent;

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
