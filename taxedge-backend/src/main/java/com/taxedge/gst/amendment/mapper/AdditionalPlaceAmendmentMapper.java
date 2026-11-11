package com.taxedge.gst.amendment.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.taxedge.gst.amendment.dto.AdditionalPlaceAmendmentViewDto;
import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AdditionalPlaceAmendmentMapper {

    @Mapping(target = "customerId", source = "customer.custId")
    @Mapping(target = "businessGstId", source = "gstNumber")
    AdditionalPlaceAmendmentViewDto toDto(AdditionalPlaceAmendmentEntity entity);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "assignedAgent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "gstNumber", expression = "java(dto.getGstNumber() != null && !dto.getGstNumber().isEmpty() ? dto.getGstNumber() : dto.getBusinessGstId())")
    AdditionalPlaceAmendmentEntity toEntity(AdditionalPlaceAmendmentViewDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "assignedAgent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "gstNumber", ignore = true)
    void updateEntity(AdditionalPlaceAmendmentViewDto dto, @MappingTarget AdditionalPlaceAmendmentEntity entity);
}
