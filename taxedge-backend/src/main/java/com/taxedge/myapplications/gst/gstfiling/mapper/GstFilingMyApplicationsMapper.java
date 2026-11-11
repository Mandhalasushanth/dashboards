package com.taxedge.myapplications.gst.gstfiling.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.myapplications.gst.gstfiling.dto.GstFilingMyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface GstFilingMyApplicationsMapper {

    @Mapping(target = "applicationType", constant = "GST_FILING")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "documentId", source = "documents.documentId")
    @Mapping(target = "salesInvoiceUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getSalesInvoice() != null && filing.getDocuments().getSalesInvoice().length > 0)")
    @Mapping(target = "purchaseInvoicesUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getPurchaseInvoices() != null && filing.getDocuments().getPurchaseInvoices().length > 0)")
    @Mapping(target = "gstr2bItcStatementUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getGstr2bItcStatement() != null && filing.getDocuments().getGstr2bItcStatement().length > 0)")
    @Mapping(target = "creditNotesUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getCreditNotes() != null && filing.getDocuments().getCreditNotes().length > 0)")
    @Mapping(target = "debitNotesUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getDebitNotes() != null && filing.getDocuments().getDebitNotes().length > 0)")
    @Mapping(target = "eInvoiceDataUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getEInvoiceData() != null && filing.getDocuments().getEInvoiceData().length > 0)")
    @Mapping(target = "eWayBillDataUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getEWayBillData() != null && filing.getDocuments().getEWayBillData().length > 0)")
    @Mapping(target = "expenseInvoicesAndVouchersUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getExpenseInvoicesAndVouchers() != null && filing.getDocuments().getExpenseInvoicesAndVouchers().length > 0)")
    @Mapping(target = "bankStatementUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getBankStatement() != null && filing.getDocuments().getBankStatement().length > 0)")
    @Mapping(target = "previousGstReturnsUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getPreviousGstReturns() != null && filing.getDocuments().getPreviousGstReturns().length > 0)")
    @Mapping(target = "previousFilingAcknowledgementUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getPreviousFilingAcknowledgement() != null && filing.getDocuments().getPreviousFilingAcknowledgement().length > 0)")
    @Mapping(target = "otherSupportingDocumentsUploaded", expression = "java(filing.getDocuments() != null && filing.getDocuments().getOtherSupportingDocuments() != null && filing.getDocuments().getOtherSupportingDocuments().length > 0)")
    GstFilingMyApplicationResponseDto toDto(GstFiling filing);
}
