package com.taxedge.loan.businessloan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.businessloan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.businessloan.entity.BusinessLoanApplication;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface BusinessLoanApplicationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "lastActivityAt", ignore = true)
    BusinessLoanApplication toEntity(BusinessLoanApplicationDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "lastActivityAt", ignore = true)
    void updateFromDto(BusinessLoanApplicationDto dto,
                       @MappingTarget BusinessLoanApplication entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.SET_TO_NULL)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "lastActivityAt", ignore = true)
    void replaceDraftFromDto(BusinessLoanApplicationDto dto,
                             @MappingTarget BusinessLoanApplication entity);

    @Mapping(target = "custId", source = "customer.custId")
    @Mapping(target = "businessProfile", ignore = true)
    @Mapping(target = "lastActivityAt", source = "lastActivityAt")
    BusinessLoanApplicationDto toDto(BusinessLoanApplication entity);
}
