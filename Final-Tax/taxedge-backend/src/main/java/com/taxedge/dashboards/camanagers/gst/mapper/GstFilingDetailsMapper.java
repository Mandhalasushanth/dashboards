package com.taxedge.dashboards.camanagers.gst.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstFilingDetailsDto;
import com.taxedge.gst.filing.entity.GstFiling;

@Mapper(componentModel = "spring")
public interface GstFilingDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    // Document fields
    @Mapping(target = "documentId", source = "documents.documentId")
    @Mapping(target = "salesInvoice", source = "documents.salesInvoice")
    @Mapping(target = "purchaseInvoices", source = "documents.purchaseInvoices")
    @Mapping(target = "gstr2bItcStatement", source = "documents.gstr2bItcStatement")
    @Mapping(target = "creditNotes", source = "documents.creditNotes")
    @Mapping(target = "debitNotes", source = "documents.debitNotes")
    @Mapping(target = "eInvoiceData", source = "documents.EInvoiceData")
    @Mapping(target = "eWayBillData", source = "documents.EWayBillData")
    @Mapping(target = "expenseInvoicesAndVouchers", source = "documents.expenseInvoicesAndVouchers")
    @Mapping(target = "bankStatement", source = "documents.bankStatement")
    @Mapping(target = "previousGstReturns", source = "documents.previousGstReturns")
    @Mapping(target = "previousFilingAcknowledgement", source = "documents.previousFilingAcknowledgement")
    @Mapping(target = "otherSupportingDocuments", source = "documents.otherSupportingDocuments")
    GstFilingDetailsDto toDto(GstFiling filing);

    List<GstFilingDetailsDto> toDtoList(List<GstFiling> filings);
}
