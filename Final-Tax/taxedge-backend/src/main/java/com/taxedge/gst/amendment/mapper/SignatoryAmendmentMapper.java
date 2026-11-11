package com.taxedge.gst.amendment.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.taxedge.gst.amendment.dto.SignatoryAmendmentViewDto;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SignatoryAmendmentMapper {

    @Mapping(target = "customerId", source = "customer.custId")
    @Mapping(target = "businessGstId", source = "gstNumber")
    @Mapping(target = "newSignatoryDesignation", source = "newDesignation")
    @Mapping(target = "designation", source = "newDesignation")
    SignatoryAmendmentViewDto toDto(SignatoryAmendmentEntity entity);

    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "assignedAgent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "gstNumber", expression = "java(dto.getGstNumber() != null && !dto.getGstNumber().isEmpty() ? dto.getGstNumber() : dto.getBusinessGstId())")
    SignatoryAmendmentEntity toEntity(SignatoryAmendmentViewDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "assignedAgent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "gstNumber", ignore = true)
    void updateEntity(SignatoryAmendmentViewDto dto, @MappingTarget SignatoryAmendmentEntity entity);
}
