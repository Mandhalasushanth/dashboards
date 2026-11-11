package com.taxedge.itr.reviseditr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.itr.reviseditr.dto.RevisionReasonDto;
import com.taxedge.itr.reviseditr.entity.RevisionReasonEntity;

@Mapper(componentModel = "spring")
public interface RevisionReasonMapper {

	@Mapping(target = "revisionReasonId", ignore = true)
	@Mapping(target = "revisedItr", ignore = true)
	RevisionReasonEntity toEntity(RevisionReasonDto dto);

	@Mapping(target = "revisionReasonId", ignore = true)
	@Mapping(target = "revisedItr", ignore = true)
	void updateEntity(RevisionReasonDto dto, @MappingTarget RevisionReasonEntity revisionReason);

	@Mapping(target = "revisedItrId", source = "revisedItr.revisedItrId")
	RevisionReasonDto toDto(RevisionReasonEntity revisionReason);
}
