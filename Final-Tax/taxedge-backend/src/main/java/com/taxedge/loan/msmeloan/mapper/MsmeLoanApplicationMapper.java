package com.taxedge.loan.msmeloan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.msmeloan.dto.MsmeLoanApplicationDto;
import com.taxedge.loan.msmeloan.dto.MsmeLoanApplicationDto.OperatingAddress;
import com.taxedge.loan.msmeloan.entity.MsmeLoanApplication;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MsmeLoanApplicationMapper {

    @Mapping(target = "custId", source = "customer.custId")
    @Mapping(target = "operatingAddress", expression = "java(toOperatingAddress(entity))")
    MsmeLoanApplicationDto toDto(MsmeLoanApplication entity);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "operatingAddressHouseNumber", source = "operatingAddress.houseNumber")
    @Mapping(target = "operatingAddressStreet", source = "operatingAddress.street")
    @Mapping(target = "operatingAddressCity", source = "operatingAddress.city")
    @Mapping(target = "operatingAddressState", source = "operatingAddress.state")
    @Mapping(target = "operatingAddressPincode", source = "operatingAddress.pincode")
    MsmeLoanApplication toEntity(MsmeLoanApplicationDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "operatingAddressHouseNumber", source = "operatingAddress.houseNumber")
    @Mapping(target = "operatingAddressStreet", source = "operatingAddress.street")
    @Mapping(target = "operatingAddressCity", source = "operatingAddress.city")
    @Mapping(target = "operatingAddressState", source = "operatingAddress.state")
    @Mapping(target = "operatingAddressPincode", source = "operatingAddress.pincode")
    void updateFromDto(MsmeLoanApplicationDto dto, @MappingTarget MsmeLoanApplication entity);

    default OperatingAddress toOperatingAddress(MsmeLoanApplication entity) {
        if (entity.getOperatingAddressHouseNumber() == null
                && entity.getOperatingAddressStreet() == null
                && entity.getOperatingAddressCity() == null
                && entity.getOperatingAddressState() == null
                && entity.getOperatingAddressPincode() == null) {
            return null;
        }
        return new OperatingAddress(
                entity.getOperatingAddressHouseNumber(),
                entity.getOperatingAddressStreet(),
                entity.getOperatingAddressCity(),
                entity.getOperatingAddressState(),
                entity.getOperatingAddressPincode());
    }
}
