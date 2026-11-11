package com.taxedge.myapplications.gst.gstcompliance.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.myapplications.gst.gstcompliance.dto.GstComplianceMyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface GstComplianceMyApplicationsMapper {

    @Mapping(target = "complianceId", source = "complinaceId")
    @Mapping(target = "applicationType", constant = "GST_COMPLIANCE")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "reconciliationFile1Uploaded", expression = "java(compliance.getReconciliationFile1() != null && compliance.getReconciliationFile1().length > 0)")
    @Mapping(target = "reconciliationFile2Uploaded", expression = "java(compliance.getReconciliationFile2() != null && compliance.getReconciliationFile2().length > 0)")
    @Mapping(target = "noticeFileUploaded", expression = "java(compliance.getNoticeFile() != null && compliance.getNoticeFile().length > 0)")
    GstComplianceMyApplicationResponseDto toDto(GstCompliance compliance);
}
