package com.taxedge.dashboards.camanagers.gst.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstComplianceDetailsDto;
import com.taxedge.gst.compliance.entity.GstCompliance;

@Mapper(componentModel = "spring")
public interface GstComplianceDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    @Mapping(target = "complianceId", source = "complinaceId")
    GstComplianceDetailsDto toDto(GstCompliance compliance);

    List<GstComplianceDetailsDto> toDtoList(List<GstCompliance> compliances);
}

