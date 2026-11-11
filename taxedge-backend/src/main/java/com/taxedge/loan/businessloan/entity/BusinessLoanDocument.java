package com.taxedge.loan.businessloan.entity;

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

@Entity
@Table(name = "business_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLoanDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true,
                foreignKey = @ForeignKey(name = "fk_loan_document_application"))
    private BusinessLoanApplication loanApplication;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "pan_card_file", columnDefinition = "bytea")
    private byte[] panCardFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "aadhaar_card_file", columnDefinition = "bytea")
    private byte[] aadhaarCardFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "kyc_directors_file", columnDefinition = "bytea")
    private byte[] kycDirectorsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "business_address_proof_file", columnDefinition = "bytea")
    private byte[] businessAddressProofFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "bank_statements_file", columnDefinition = "bytea")
    private byte[] bankStatementsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "gst_certificate_file", columnDefinition = "bytea")
    private byte[] gstCertificateFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "gst_returns_file", columnDefinition = "bytea")
    private byte[] gstReturnsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "business_itr_file", columnDefinition = "bytea")
    private byte[] businessItrFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "audited_balance_sheet_file", columnDefinition = "bytea")
    private byte[] auditedBalanceSheetFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "profit_loss_statement_file", columnDefinition = "bytea")
    private byte[] profitLossStatementFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "cash_flow_statement_file", columnDefinition = "bytea")
    private byte[] cashFlowStatementFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "udyam_certificate_file", columnDefinition = "bytea")
    private byte[] udyamCertificateFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "business_registration_proof_file", columnDefinition = "bytea")
    private byte[] businessRegistrationProofFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "business_expansion_document_file", columnDefinition = "bytea")
    private byte[] businessExpansionDocumentFile;

    @Column(name = "pan_card_file_name", length = 255)
    private String panCardFileName;
    @Column(name = "pan_card_content_type", length = 150)
    private String panCardContentType;
    @Column(name = "business_registration_file_name", length = 255)
    private String businessRegistrationFileName;
    @Column(name = "business_registration_content_type", length = 150)
    private String businessRegistrationContentType;
    @Column(name = "bank_statements_file_name", length = 255)
    private String bankStatementsFileName;
    @Column(name = "bank_statements_content_type", length = 150)
    private String bankStatementsContentType;
    @Column(name = "business_expansion_file_name", length = 255)
    private String businessExpansionFileName;
    @Column(name = "business_expansion_content_type", length = 150)
    private String businessExpansionContentType;
    @Column(name = "gst_certificate_file_name", length = 255)
    private String gstCertificateFileName;
    @Column(name = "gst_certificate_content_type", length = 150)
    private String gstCertificateContentType;
    @Column(name = "profit_loss_statement_file_name", length = 255)
    private String profitLossStatementFileName;
    @Column(name = "profit_loss_statement_content_type", length = 150)
    private String profitLossStatementContentType;

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
