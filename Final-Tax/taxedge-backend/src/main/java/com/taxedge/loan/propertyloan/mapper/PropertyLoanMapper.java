package com.taxedge.loan.propertyloan.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.taxedge.loan.propertyloan.dto.PropertyLoanCreateRequest;
import com.taxedge.loan.propertyloan.dto.PropertyLoanResponse;
import com.taxedge.loan.propertyloan.dto.PropertyLoanUpdateRequest;
import com.taxedge.loan.propertyloan.entity.PropertyLoanApplication;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PropertyLoanMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PropertyLoanApplication toEntity(PropertyLoanCreateRequest request);

    @Mapping(target = "custId", source = "customer.custId")
    PropertyLoanResponse toResponse(PropertyLoanApplication entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateFromRequest(PropertyLoanUpdateRequest request, @MappingTarget PropertyLoanApplication entity);
}
