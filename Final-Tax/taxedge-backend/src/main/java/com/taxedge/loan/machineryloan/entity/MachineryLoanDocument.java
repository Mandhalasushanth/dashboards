package com.taxedge.loan.machineryloan.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "machinery_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(onlyExplicitlyIncluded = true)
public class MachineryLoanDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machinery_loan_id", unique = true, nullable = false,
                foreignKey = @ForeignKey(name = "fk_machinery_loan_document_application"))
    private MachineryLoanApplication machineryLoanApplication;

    // -------------------------------------------------------------- banking

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "bank_statement_file", columnDefinition = "bytea")
    private byte[] bankStatementFile;

    // --------------------------------------------------------- business & tax

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "machinery_quotation_file", columnDefinition = "bytea")
    private byte[] machineryQuotationFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "gst_certificate_file", columnDefinition = "bytea")
    private byte[] gstCertificateFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "business_registration_proof_file", columnDefinition = "bytea")
    private byte[] businessRegistrationProofFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "udyam_certificate_file", columnDefinition = "bytea")
    private byte[] udyamCertificateFile;

    // ------------------------------------------------------------- metadata

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.documentId == null) {
            this.documentId = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        this.createdAt = LocalDateTime.now();
    }
}
