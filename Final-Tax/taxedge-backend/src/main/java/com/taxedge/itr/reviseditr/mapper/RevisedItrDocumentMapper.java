package com.taxedge.itr.reviseditr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.itr.reviseditr.dto.RevisedItrDocumentDto;
import com.taxedge.itr.reviseditr.entity.RevisedItrDocument;

@Mapper(componentModel = "spring")
public interface RevisedItrDocumentMapper {

	@Mapping(target = "documentId", ignore = true)
	@Mapping(target = "revisedItr", ignore = true)
	RevisedItrDocument toEntity(RevisedItrDocumentDto dto);

	@Mapping(target = "documentId", ignore = true)
	@Mapping(target = "revisedItr", ignore = true)
	void updateEntity(RevisedItrDocumentDto dto, @MappingTarget RevisedItrDocument document);

	@Mapping(target = "revisedItrId", source = "revisedItr.revisedItrId")
	RevisedItrDocumentDto toDto(RevisedItrDocument document);
}
