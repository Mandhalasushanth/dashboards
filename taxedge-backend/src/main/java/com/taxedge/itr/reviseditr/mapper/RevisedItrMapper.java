package com.taxedge.itr.reviseditr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.itr.reviseditr.dto.RevisedItrDto;
import com.taxedge.itr.reviseditr.entity.RevisedItr;

@Mapper(componentModel = "spring")
public interface RevisedItrMapper {

	@Mapping(target = "revisedItrId", ignore = true)
	@Mapping(target = "customer", ignore = true)
	@Mapping(target = "details", ignore = true)
	@Mapping(target = "document", ignore = true)
	@Mapping(target = "revisionReason", ignore = true)
	@Mapping(target = "status", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	@Mapping(target = "updatedAt", ignore = true)
	@Mapping(target = "submittedAt", ignore = true)
	@Mapping(target = "assignedAgent", ignore = true)
	RevisedItr toEntity(RevisedItrDto dto);

	@Mapping(target = "revisedItrId", ignore = true)
	@Mapping(target = "customer", ignore = true)
	@Mapping(target = "details", ignore = true)
	@Mapping(target = "document", ignore = true)
	@Mapping(target = "revisionReason", ignore = true)
	@Mapping(target = "status", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	@Mapping(target = "updatedAt", ignore = true)
	@Mapping(target = "submittedAt", ignore = true)
	@Mapping(target = "assignedAgent", ignore = true)
	void updateEntity(RevisedItrDto dto, @MappingTarget RevisedItr revisedItr);
}
