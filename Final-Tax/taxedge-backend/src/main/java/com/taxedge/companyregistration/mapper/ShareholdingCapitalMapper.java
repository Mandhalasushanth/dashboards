package com.taxedge.companyregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.companyregistration.dto.ShareholdingCapitalDto;
import com.taxedge.companyregistration.entity.ShareholdingCapital;

@Mapper(componentModel = "spring", uses = ShareholdingPatternMapper.class)
public interface ShareholdingCapitalMapper {

	@Mapping(target = "shareholdingCapitalId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	@Mapping(target = "shareholdingPattern", ignore = true)
	ShareholdingCapital toEntity(ShareholdingCapitalDto dto);

	@Mapping(target = "companyRegistrationId", source = "companyDetails.companyRegistrationId")
	ShareholdingCapitalDto toDto(ShareholdingCapital entity);

	@Mapping(target = "shareholdingCapitalId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	@Mapping(target = "shareholdingPattern", ignore = true)
	void updateEntity(ShareholdingCapitalDto dto, @MappingTarget ShareholdingCapital entity);
}