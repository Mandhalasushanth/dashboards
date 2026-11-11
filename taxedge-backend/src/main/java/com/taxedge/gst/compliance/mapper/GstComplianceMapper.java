package com.taxedge.gst.compliance.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.compliance.dto.GstComplianceDto;
import com.taxedge.gst.compliance.entity.GstCompliance;

@Mapper(componentModel = "spring")
public interface GstComplianceMapper {

    @Mapping(target = "customerId", source = "customer.custId")
    @Mapping(target = "reconciliationFile1", source = "reconciliationFile1")
    @Mapping(target = "reconciliationFile2", source = "reconciliationFile2")
    @Mapping(target = "noticeFile", source = "noticeFile")
    GstComplianceDto toDto(GstCompliance compliance);

    List<GstComplianceDto> toDtoList(List<GstCompliance> compliances);
}
