package com.taxedge.itr.filing.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.itr.filing.dto.DocumentDto;
import com.taxedge.itr.filing.entity.ItrDocument;

@Mapper(componentModel = "spring")
public interface ItrDocumentMapper {

	@Mapping(target = "documentId", ignore = true)
	@Mapping(target = "itrFiling", ignore = true)
	ItrDocument toEntity(DocumentDto dto);

	@Mapping(target = "documentId", ignore = true)
	@Mapping(target = "itrFiling", ignore = true)
	void updateEntity(DocumentDto dto, @MappingTarget ItrDocument itrDocument);

	DocumentDto toDto(ItrDocument itrDocument);
}
