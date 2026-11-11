package com.taxedge.companyregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.companyregistration.dto.CompanyDetailsDto;
import com.taxedge.companyregistration.entity.CompanyDetails;

@Mapper(componentModel = "spring")
public interface CompanyDetailsMapper {

	@Mapping(target = "companyRegistrationId", ignore = true)
	@Mapping(target = "customer", ignore = true)
	CompanyDetails toEntity(CompanyDetailsDto dto);

	@Mapping(target = "companyRegistrationId", ignore = true)
	@Mapping(target = "customer", ignore = true)
	void updateEntity(CompanyDetailsDto dto, @MappingTarget CompanyDetails entity);

	@Mapping(target = "customerId", source = "customer.custId")
	CompanyDetailsDto toDto(CompanyDetails entity);
}
