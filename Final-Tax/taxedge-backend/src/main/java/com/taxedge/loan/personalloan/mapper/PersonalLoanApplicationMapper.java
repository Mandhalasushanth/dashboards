package com.taxedge.loan.personalloan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.personalloan.dto.PersonalLoanApplicationDto;
import com.taxedge.loan.personalloan.entity.PersonalLoanApplication;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface PersonalLoanApplicationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    PersonalLoanApplication toEntity(PersonalLoanApplicationDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateFromDto(PersonalLoanApplicationDto dto,
                       @MappingTarget PersonalLoanApplication entity);

    @Mapping(target = "custId", source = "customer.custId")
    PersonalLoanApplicationDto toDto(PersonalLoanApplication entity);
}
