package com.taxedge.loan.vehicleloan.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.taxedge.loan.vehicleloan.dto.VehicleLoanCreateRequest;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDetailsDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanResponse;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanUpdateRequest;
import com.taxedge.loan.vehicleloan.entity.VehicleLoanApplication;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleLoanApplicationMapper {

    @Mapping(target = "customerId", source = "customer.custId")
    VehicleLoanResponse toResponse(VehicleLoanApplication entity);

    @Mapping(target = "vehicleLoanId", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "applicationStatus", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VehicleLoanApplication toEntity(VehicleLoanCreateRequest request);

    @Mapping(target = "vehicleLoanId", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "applicationStatus", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VehicleLoanApplication toEntityFromDetailsDto(VehicleLoanDetailsDto dto);

    @Mapping(target = "vehicleLoanId", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "applicationStatus", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(VehicleLoanUpdateRequest request, @MappingTarget VehicleLoanApplication entity);

    @Mapping(target = "vehicleLoanId", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "applicationStatus", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDetailsDto(VehicleLoanDetailsDto dto, @MappingTarget VehicleLoanApplication entity);
}
