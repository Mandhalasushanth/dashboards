
package com.taxedge.loan.homeloan.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeLoanDocumentRequestDto {

    private MultipartFile propertyOwnershipDocument;

    private MultipartFile bankStatementIncomeDocument;

    private MultipartFile propertyQuotationBuilderDocument;

    private MultipartFile additionalPropertyDocument;

    private MultipartFile constructionDocument;

    private MultipartFile sanctionedBuildingPlan;

    private MultipartFile constructionCostEstimate;

    private MultipartFile renovationCostEstimate;

    private MultipartFile contractorQuotation;

    private MultipartFile existingLoanStatement;

    private MultipartFile propertyDocumentCopy;

    private MultipartFile foreclosureOutstandingStatement;

    public java.util.Map<String, MultipartFile> toMap() {
        java.util.Map<String, MultipartFile> map = new java.util.HashMap<>();
        if (propertyOwnershipDocument != null && !propertyOwnershipDocument.isEmpty()) map.put("propertyOwnershipDocument", propertyOwnershipDocument);
        if (bankStatementIncomeDocument != null && !bankStatementIncomeDocument.isEmpty()) map.put("bankStatementIncomeDocument", bankStatementIncomeDocument);
        if (propertyQuotationBuilderDocument != null && !propertyQuotationBuilderDocument.isEmpty()) map.put("propertyQuotationBuilderDocument", propertyQuotationBuilderDocument);
        if (additionalPropertyDocument != null && !additionalPropertyDocument.isEmpty()) map.put("additionalPropertyDocument", additionalPropertyDocument);
        if (constructionDocument != null && !constructionDocument.isEmpty()) map.put("constructionDocument", constructionDocument);
        if (sanctionedBuildingPlan != null && !sanctionedBuildingPlan.isEmpty()) map.put("sanctionedBuildingPlan", sanctionedBuildingPlan);
        if (constructionCostEstimate != null && !constructionCostEstimate.isEmpty()) map.put("constructionCostEstimate", constructionCostEstimate);
        if (renovationCostEstimate != null && !renovationCostEstimate.isEmpty()) map.put("renovationCostEstimate", renovationCostEstimate);
        if (contractorQuotation != null && !contractorQuotation.isEmpty()) map.put("contractorQuotation", contractorQuotation);
        if (existingLoanStatement != null && !existingLoanStatement.isEmpty()) map.put("existingLoanStatement", existingLoanStatement);
        if (propertyDocumentCopy != null && !propertyDocumentCopy.isEmpty()) map.put("propertyDocumentCopy", propertyDocumentCopy);
        if (foreclosureOutstandingStatement != null && !foreclosureOutstandingStatement.isEmpty()) map.put("foreclosureOutstandingStatement", foreclosureOutstandingStatement);
        return map;
    }
}
