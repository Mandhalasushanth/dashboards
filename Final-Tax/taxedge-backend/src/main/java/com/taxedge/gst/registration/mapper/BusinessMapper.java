package com.taxedge.gst.registration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.gst.registration.dto.BusinessRequest;
import com.taxedge.gst.registration.dto.BusinessResponse;
import com.taxedge.gst.registration.dto.BusinessUpdateRequest;
import com.taxedge.gst.registration.entity.Business;

@Mapper(componentModel = "spring")
public interface BusinessMapper {

	@Mapping(target = "gstId", ignore = true)
	@Mapping(target = "customer", ignore = true)
	@Mapping(target = "documents", ignore = true)
	@Mapping(target = "assignedAgent", ignore = true)
	@Mapping(target = "status", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	@Mapping(target = "updatedAt", ignore = true)
	@Mapping(target = "submittedAt", ignore = true)
	Business toEntity(BusinessRequest request);

	@Mapping(target = "gstId", ignore = true)
	@Mapping(target = "customer", ignore = true)
	@Mapping(target = "documents", ignore = true)
	@Mapping(target = "assignedAgent", ignore = true)
	@Mapping(target = "status", ignore = true)
	@Mapping(target = "createdAt", ignore = true)
	@Mapping(target = "updatedAt", ignore = true)
	@Mapping(target = "submittedAt", ignore = true)
	void updateEntity(BusinessUpdateRequest request, @MappingTarget Business business);

	@Mapping(target = "customerId", source = "customer.custId")
	BusinessResponse toResponse(Business business);
}
