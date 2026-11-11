
package com.taxedge.loan.homeloan.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import jakarta.persistence.PrePersist;

import com.taxedge.loan.homeloan.entity.HomeLoanRequirementApplication;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "home_loan_documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeLoanDocument {

    @Id
    @Column(name = "document_id", nullable = false, unique = true, length = 50)
    private String documentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_loan_id", nullable = false, unique = true)
    private HomeLoanRequirementApplication homeLoanApplication;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "property_ownership_document", columnDefinition = "bytea")
    private byte[] propertyOwnershipDocument;

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
    @Column(name = "existing_loan_statement", columnDefinition = "bytea")
    private byte[] existingLoanStatement;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "property_document_copy", columnDefinition = "bytea")
    private byte[] propertyDocumentCopy;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "foreclosure_outstanding_statement", columnDefinition = "bytea")
    private byte[] foreclosureOutstandingStatement;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public byte[] getContent(String documentType) {
        if (documentType == null)
            return null;
        return switch (documentType) {
            case "propertyOwnershipDocument" -> propertyOwnershipDocument;
            case "bankStatementIncomeDocument" -> bankStatementIncomeDocument;
            case "propertyQuotationBuilderDocument" -> propertyQuotationBuilderDocument;
            case "additionalPropertyDocument" -> additionalPropertyDocument;
            case "constructionDocument" -> constructionDocument;
            case "sanctionedBuildingPlan" -> sanctionedBuildingPlan;
            case "constructionCostEstimate" -> constructionCostEstimate;
            case "renovationCostEstimate" -> renovationCostEstimate;
            case "contractorQuotation" -> contractorQuotation;
            case "existingLoanStatement" -> existingLoanStatement;
            case "propertyDocumentCopy" -> propertyDocumentCopy;
            case "foreclosureOutstandingStatement" -> foreclosureOutstandingStatement;
            default -> null;
        };
    }

    public void setContent(String documentType, byte[] content) {
        if (documentType == null)
            return;
        switch (documentType) {
            case "propertyOwnershipDocument" -> this.propertyOwnershipDocument = content;
            case "bankStatementIncomeDocument" -> this.bankStatementIncomeDocument = content;
            case "propertyQuotationBuilderDocument" -> this.propertyQuotationBuilderDocument = content;
            case "additionalPropertyDocument" -> this.additionalPropertyDocument = content;
            case "constructionDocument" -> this.constructionDocument = content;
            case "sanctionedBuildingPlan" -> this.sanctionedBuildingPlan = content;
            case "constructionCostEstimate" -> this.constructionCostEstimate = content;
            case "renovationCostEstimate" -> this.renovationCostEstimate = content;
            case "contractorQuotation" -> this.contractorQuotation = content;
            case "existingLoanStatement" -> this.existingLoanStatement = content;
            case "propertyDocumentCopy" -> this.propertyDocumentCopy = content;
            case "foreclosureOutstandingStatement" -> this.foreclosureOutstandingStatement = content;
            default -> throw new IllegalArgumentException("Unknown document type: " + documentType);
        }
    }
}