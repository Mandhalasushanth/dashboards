package com.taxedge.companyregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.companyregistration.dto.PromoterDirectorDetailsDto;
import com.taxedge.companyregistration.entity.PromoterDirectorDetails;

@Mapper(componentModel = "spring")
public interface PromoterDirectorDetailsMapper {

	@Mapping(target = "promoterDirectorId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	PromoterDirectorDetails toEntity(PromoterDirectorDetailsDto dto);

	@Mapping(target = "promoterDirectorId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	void updateEntity(PromoterDirectorDetailsDto dto, @MappingTarget PromoterDirectorDetails entity);

	@Mapping(target = "companyRegistrationId", source = "companyDetails.companyRegistrationId")
	PromoterDirectorDetailsDto toDto(PromoterDirectorDetails entity);
}