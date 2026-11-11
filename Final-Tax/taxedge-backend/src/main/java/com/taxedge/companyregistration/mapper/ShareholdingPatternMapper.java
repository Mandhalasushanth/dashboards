package com.taxedge.companyregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.companyregistration.dto.ShareholdingPatternDto;
import com.taxedge.companyregistration.entity.ShareholdingPattern;

@Mapper(componentModel = "spring")
public interface ShareholdingPatternMapper {

	@Mapping(target = "shareholdingPatternId", ignore = true)
	@Mapping(target = "shareholdingCapital", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	@Mapping(target = "promoterDirectorDetails", ignore = true)
	ShareholdingPattern toEntity(ShareholdingPatternDto dto);

	@Mapping(target = "promoterDirectorId", source = "promoterDirectorDetails.promoterDirectorId")
	ShareholdingPatternDto toDto(ShareholdingPattern entity);

	@Mapping(target = "shareholdingPatternId", ignore = true)
	@Mapping(target = "shareholdingCapital", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	@Mapping(target = "promoterDirectorDetails", ignore = true)
	void updateEntity(ShareholdingPatternDto dto, @MappingTarget ShareholdingPattern entity);
}