package com.taxedge.gst.registration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.registration.dto.DocumentsDto;
import com.taxedge.gst.registration.entity.Documents;

@Mapper(componentModel = "spring")
public interface DocumentsMapper {

	@Mapping(target = "gstId", source = "business.gstId")
	DocumentsDto toDto(Documents documents);
}
