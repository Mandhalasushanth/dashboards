package com.taxedge.loan.msmeloan.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.taxedge.loan.msmeloan.enums.MsmeDocumentType;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "msme_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MsmeLoanDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "msme_loan_id", unique = true, nullable = false,
                foreignKey = @ForeignKey(name = "fk_msme_loan_document_application"))
    private MsmeLoanApplication loanApplication;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "pan_card_file", columnDefinition = "bytea")
    private byte[] panCardFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "aadhaar_card_file", columnDefinition = "bytea")
    private byte[] aadhaarCardFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "udyam_certificate_file", columnDefinition = "bytea")
    private byte[] udyamCertificateFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "gst_certificate_file", columnDefinition = "bytea")
    private byte[] gstCertificateFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "bank_statements_file", columnDefinition = "bytea")
    private byte[] bankStatementsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "itr_returns_file", columnDefinition = "bytea")
    private byte[] itrReturnsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "financial_statements_file", columnDefinition = "bytea")
    private byte[] financialStatementsFile;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (this.documentId == null) {
            this.documentId = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
