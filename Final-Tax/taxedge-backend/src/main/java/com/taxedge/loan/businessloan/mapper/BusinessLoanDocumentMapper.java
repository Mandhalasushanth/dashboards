package com.taxedge.loan.businessloan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.businessloan.dto.BusinessLoanDocumentDto;
import com.taxedge.loan.businessloan.entity.BusinessLoanDocument;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface BusinessLoanDocumentMapper {

    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "loanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "gstCertificateFileName", ignore = true)
    @Mapping(target = "gstCertificateContentType", ignore = true)
    @Mapping(target = "profitLossStatementFileName", ignore = true)
    @Mapping(target = "profitLossStatementContentType", ignore = true)
    BusinessLoanDocument toEntity(BusinessLoanDocumentDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "loanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "gstCertificateFileName", ignore = true)
    @Mapping(target = "gstCertificateContentType", ignore = true)
    @Mapping(target = "profitLossStatementFileName", ignore = true)
    @Mapping(target = "profitLossStatementContentType", ignore = true)
    void updateFromDto(BusinessLoanDocumentDto dto, @MappingTarget BusinessLoanDocument entity);

    @Mapping(target = "loanApplicationId", source = "loanApplication.id")
    BusinessLoanDocumentDto toDto(BusinessLoanDocument entity);
}
