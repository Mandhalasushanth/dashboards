package com.taxedge.companyregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.companyregistration.dto.RegisteredOfficeDetailsDto;
import com.taxedge.companyregistration.entity.RegisteredOfficeDetails;

@Mapper(componentModel = "spring")
public interface RegisteredOfficeDetailsMapper {

	@Mapping(target = "registeredOfficeId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	RegisteredOfficeDetails toEntity(RegisteredOfficeDetailsDto dto);

	@Mapping(target = "registeredOfficeId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	void updateEntity(RegisteredOfficeDetailsDto dto, @MappingTarget RegisteredOfficeDetails entity);

	@Mapping(target = "companyRegistrationId", source = "companyDetails.companyRegistrationId")
	RegisteredOfficeDetailsDto toDto(RegisteredOfficeDetails entity);
}