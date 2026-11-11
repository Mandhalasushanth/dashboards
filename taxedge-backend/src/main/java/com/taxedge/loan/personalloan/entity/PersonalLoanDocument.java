package com.taxedge.loan.personalloan.entity;

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
@Table(name = "personal_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalLoanDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true,
                foreignKey = @ForeignKey(name = "fk_personal_loan_document_application"))
    private PersonalLoanApplication loanApplication;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "pan_card_file", columnDefinition = "bytea")
    private byte[] panCardFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "aadhaar_card_file", columnDefinition = "bytea")
    private byte[] aadhaarCardFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "address_proof_file", columnDefinition = "bytea")
    private byte[] addressProofFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "photograph_file", columnDefinition = "bytea")
    private byte[] photographFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "bank_statements_file", columnDefinition = "bytea")
    private byte[] bankStatementsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "salary_slips_file", columnDefinition = "bytea")
    private byte[] salarySlipsFile;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "itr_acknowledgment_file", columnDefinition = "bytea")
    private byte[] itrAcknowledgmentFile;

    @Column(name = "pan_card_file_name", columnDefinition = "text")
    private String panCardFileName;

    @Column(name = "pan_card_file_content_type", length = 255)
    private String panCardFileContentType;

    @Column(name = "pan_card_file_size")
    private Long panCardFileSize;

    @Column(name = "aadhaar_card_file_name", columnDefinition = "text")
    private String aadhaarCardFileName;

    @Column(name = "aadhaar_card_file_content_type", length = 255)
    private String aadhaarCardFileContentType;

    @Column(name = "aadhaar_card_file_size")
    private Long aadhaarCardFileSize;

    @Column(name = "address_proof_file_name", columnDefinition = "text")
    private String addressProofFileName;

    @Column(name = "address_proof_file_content_type", length = 255)
    private String addressProofFileContentType;

    @Column(name = "address_proof_file_size")
    private Long addressProofFileSize;

    @Column(name = "photograph_file_name", columnDefinition = "text")
    private String photographFileName;

    @Column(name = "photograph_file_content_type", length = 255)
    private String photographFileContentType;

    @Column(name = "photograph_file_size")
    private Long photographFileSize;

    @Column(name = "bank_statements_file_name", columnDefinition = "text")
    private String bankStatementsFileName;

    @Column(name = "bank_statements_file_content_type", length = 255)
    private String bankStatementsFileContentType;

    @Column(name = "bank_statements_file_size")
    private Long bankStatementsFileSize;

    @Column(name = "salary_slips_file_name", columnDefinition = "text")
    private String salarySlipsFileName;

    @Column(name = "salary_slips_file_content_type", length = 255)
    private String salarySlipsFileContentType;

    @Column(name = "salary_slips_file_size")
    private Long salarySlipsFileSize;

    @Column(name = "itr_acknowledgment_file_name", columnDefinition = "text")
    private String itrAcknowledgmentFileName;

    @Column(name = "itr_acknowledgment_file_content_type", length = 255)
    private String itrAcknowledgmentFileContentType;

    @Column(name = "itr_acknowledgment_file_size")
    private Long itrAcknowledgmentFileSize;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.documentId == null) {
            this.documentId = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        this.createdAt = LocalDateTime.now();
    }

    public void setFileContent(String type, byte[] bytes) {
        if (type == null) return;
        switch (type.toLowerCase()) {
            case "pancardfile" -> this.panCardFile = bytes;
            case "aadhaarcard" -> this.aadhaarCardFile = bytes;
            case "addressproof" -> this.addressProofFile = bytes;
            case "photograph" -> this.photographFile = bytes;
            case "bankstatements" -> this.bankStatementsFile = bytes;
            case "salaryslips" -> this.salarySlipsFile = bytes;
            case "itracknowledgment" -> this.itrAcknowledgmentFile = bytes;
        }
    }

    public void setFileMetadata(String type, String fileName, String contentType, Long fileSize) {
        if (type == null) return;
        switch (type.toLowerCase()) {
            case "pancardfile" -> {
                this.panCardFileName = fileName;
                this.panCardFileContentType = contentType;
                this.panCardFileSize = fileSize;
            }
            case "aadhaarcard" -> {
                this.aadhaarCardFileName = fileName;
                this.aadhaarCardFileContentType = contentType;
                this.aadhaarCardFileSize = fileSize;
            }
            case "addressproof" -> {
                this.addressProofFileName = fileName;
                this.addressProofFileContentType = contentType;
                this.addressProofFileSize = fileSize;
            }
            case "photograph" -> {
                this.photographFileName = fileName;
                this.photographFileContentType = contentType;
                this.photographFileSize = fileSize;
            }
            case "bankstatements" -> {
                this.bankStatementsFileName = fileName;
                this.bankStatementsFileContentType = contentType;
                this.bankStatementsFileSize = fileSize;
            }
            case "salaryslips" -> {
                this.salarySlipsFileName = fileName;
                this.salarySlipsFileContentType = contentType;
                this.salarySlipsFileSize = fileSize;
            }
            case "itracknowledgment" -> {
                this.itrAcknowledgmentFileName = fileName;
                this.itrAcknowledgmentFileContentType = contentType;
                this.itrAcknowledgmentFileSize = fileSize;
            }
        }
    }

    public void clearFileMetadata(String type) {
        setFileMetadata(type, null, null, null);
    }

    public byte[] getFileContent(String type) {
        if (type == null) return null;
        return switch (type.toLowerCase()) {
            case "pancardfile" -> this.panCardFile;
            case "aadhaarcard" -> this.aadhaarCardFile;
            case "addressproof" -> this.addressProofFile;
            case "photograph" -> this.photographFile;
            case "bankstatements" -> this.bankStatementsFile;
            case "salaryslips" -> this.salarySlipsFile;
            case "itracknowledgment" -> this.itrAcknowledgmentFile;
            default -> null;
        };
    }
}
