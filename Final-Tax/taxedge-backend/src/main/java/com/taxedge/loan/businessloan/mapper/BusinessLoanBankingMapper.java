package com.taxedge.loan.businessloan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.businessloan.dto.BusinessLoanBankingDto;
import com.taxedge.loan.businessloan.entity.BusinessLoanBanking;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface BusinessLoanBankingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "loanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    BusinessLoanBanking toEntity(BusinessLoanBankingDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "loanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateFromDto(BusinessLoanBankingDto dto, @MappingTarget BusinessLoanBanking entity);

    @Mapping(target = "loanApplicationId", source = "loanApplication.id")
    BusinessLoanBankingDto toDto(BusinessLoanBanking entity);
}
