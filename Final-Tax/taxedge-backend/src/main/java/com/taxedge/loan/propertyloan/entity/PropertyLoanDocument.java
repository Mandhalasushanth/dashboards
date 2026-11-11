package com.taxedge.loan.propertyloan.entity;

import java.time.LocalDateTime;
import com.taxedge.loan.propertyloan.enums.PropertyDocumentType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_loan_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyLoanDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true, nullable = false,
                foreignKey = @ForeignKey(name = "fk_property_loan_document_app"))
    private PropertyLoanApplication loanApplication;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "property_sale_agreement_document", columnDefinition = "bytea")
    private byte[] propertySaleAgreementDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "bank_statement_income_document", columnDefinition = "bytea")
    private byte[] bankStatementIncomeDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "property_quotation_builder_document", columnDefinition = "bytea")
    private byte[] propertyQuotationBuilderDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "additional_property_document", columnDefinition = "bytea")
    private byte[] additionalPropertyDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "property_ownership_document", columnDefinition = "bytea")
    private byte[] propertyOwnershipDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "construction_document", columnDefinition = "bytea")
    private byte[] constructionDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sanctioned_building_plan", columnDefinition = "bytea")
    private byte[] sanctionedBuildingPlan;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "construction_cost_estimate", columnDefinition = "bytea")
    private byte[] constructionCostEstimate;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "renovation_cost_estimate", columnDefinition = "bytea")
    private byte[] renovationCostEstimate;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "contractor_quotation", columnDefinition = "bytea")
    private byte[] contractorQuotation;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "plot_property_ownership_document", columnDefinition = "bytea")
    private byte[] plotPropertyOwnershipDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sale_agreement", columnDefinition = "bytea")
    private byte[] saleAgreement;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "plot_quotation_cost_sheet", columnDefinition = "bytea")
    private byte[] plotQuotationCostSheet;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "sale_agreement_allotment_letter", columnDefinition = "bytea")
    private byte[] saleAgreementAllotmentLetter;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "existing_loan_statement_account_document", columnDefinition = "bytea")
    private byte[] existingLoanStatementAccountDocument;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "property_document_copy", columnDefinition = "bytea")
    private byte[] propertyDocumentCopy;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "foreclosure_outstanding_statement", columnDefinition = "bytea")
    private byte[] foreclosureOutstandingStatement;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (this.documentId == null) {
            this.documentId = "DOC-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
