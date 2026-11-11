package com.taxedge.myapplications.itr.tdsrefund.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.myapplications.itr.tdsrefund.dto.TdsRefundMyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface TdsRefundMyApplicationsMapper {

    @Mapping(target = "tdsRefundId", source = "id")
    @Mapping(target = "applicationType", constant = "TDS_REFUND")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "businessPanDocumentUploaded", expression = "java(refund.getBusinessPanDocument() != null && refund.getBusinessPanDocument().length > 0)")
    @Mapping(target = "aadhaarDocumentUploaded", expression = "java(refund.getAadhaarDocument() != null && refund.getAadhaarDocument().length > 0)")
    TdsRefundMyApplicationResponseDto toDto(TdsRefund refund);
}
