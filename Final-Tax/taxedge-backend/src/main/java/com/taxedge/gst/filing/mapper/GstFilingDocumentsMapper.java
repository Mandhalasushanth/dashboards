package com.taxedge.gst.filing.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.filing.dto.GstFilingDocumentsDto;
import com.taxedge.gst.filing.entity.GstFilingDocuments;

@Mapper(componentModel = "spring")
public interface GstFilingDocumentsMapper {

	@Mapping(target = "gstFiling", ignore = true)
	@Mapping(target = "eInvoiceData", source = "EInvoiceData")
	@Mapping(target = "eWayBillData", source = "EWayBillData")
	GstFilingDocuments toEntity(GstFilingDocumentsDto dto);

	@Mapping(target = "filingId", source = "gstFiling.gstfilingId")
	@Mapping(target = "eInvoiceData", source = "EInvoiceData")
	@Mapping(target = "eWayBillData", source = "EWayBillData")
	GstFilingDocumentsDto toDto(GstFilingDocuments entity);
}
