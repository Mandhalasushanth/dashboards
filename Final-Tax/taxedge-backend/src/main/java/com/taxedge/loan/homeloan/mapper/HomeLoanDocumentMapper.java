
package com.taxedge.loan.homeloan.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.loan.homeloan.dto.HomeLoanDocumentRequestDto;
import com.taxedge.loan.homeloan.entity.HomeLoanDocument;

@Mapper(componentModel = "spring")
public interface HomeLoanDocumentMapper {

    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "homeLoanApplication", ignore = true)
    @Mapping(target = "propertyOwnershipDocument", ignore = true)
    @Mapping(target = "bankStatementIncomeDocument", ignore = true)
    @Mapping(target = "propertyQuotationBuilderDocument", ignore = true)
    @Mapping(target = "additionalPropertyDocument", ignore = true)
    @Mapping(target = "constructionDocument", ignore = true)
    @Mapping(target = "sanctionedBuildingPlan", ignore = true)
    @Mapping(target = "constructionCostEstimate", ignore = true)
    @Mapping(target = "renovationCostEstimate", ignore = true)
    @Mapping(target = "contractorQuotation", ignore = true)
    @Mapping(target = "existingLoanStatement", ignore = true)
    @Mapping(target = "propertyDocumentCopy", ignore = true)
    @Mapping(target = "foreclosureOutstandingStatement", ignore = true)
    HomeLoanDocument toEntity(HomeLoanDocumentRequestDto dto);

    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "homeLoanApplication", ignore = true)
    @Mapping(target = "propertyOwnershipDocument", ignore = true)
    @Mapping(target = "bankStatementIncomeDocument", ignore = true)
    @Mapping(target = "propertyQuotationBuilderDocument", ignore = true)
    @Mapping(target = "additionalPropertyDocument", ignore = true)
    @Mapping(target = "constructionDocument", ignore = true)
    @Mapping(target = "sanctionedBuildingPlan", ignore = true)
    @Mapping(target = "constructionCostEstimate", ignore = true)
    @Mapping(target = "renovationCostEstimate", ignore = true)
    @Mapping(target = "contractorQuotation", ignore = true)
    @Mapping(target = "existingLoanStatement", ignore = true)
    @Mapping(target = "propertyDocumentCopy", ignore = true)
    @Mapping(target = "foreclosureOutstandingStatement", ignore = true)
    void updateEntity(
            HomeLoanDocumentRequestDto dto,
            @MappingTarget HomeLoanDocument entity);
}
