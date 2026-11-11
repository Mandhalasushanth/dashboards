package com.taxedge.itr.reviseditr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.itr.reviseditr.dto.RevisedItrDetailsDto;
import com.taxedge.itr.reviseditr.entity.RevisedItrDetails;

@Mapper(componentModel = "spring")
public interface RevisedItrDetailsMapper {

	@Mapping(target = "detailsId", ignore = true)
	@Mapping(target = "revisedItr", ignore = true)
	RevisedItrDetails toEntity(RevisedItrDetailsDto dto);

	@Mapping(target = "detailsId", ignore = true)
	@Mapping(target = "revisedItr", ignore = true)
	void updateEntity(RevisedItrDetailsDto dto, @MappingTarget RevisedItrDetails details);

	@Mapping(target = "revisedItrId", source = "revisedItr.revisedItrId")
	RevisedItrDetailsDto toDto(RevisedItrDetails details);
}
