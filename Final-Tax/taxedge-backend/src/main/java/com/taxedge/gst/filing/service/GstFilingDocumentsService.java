package com.taxedge.gst.filing.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.filing.dto.GstFilingDocumentsDto;

public interface GstFilingDocumentsService {

	String uploadDocuments(String gstfilingId, MultipartFile salesInvoice, MultipartFile purchaseInvoices,
			MultipartFile gstr2bItcStatement, MultipartFile creditNotes, MultipartFile debitNotes,
			MultipartFile eInvoiceData, MultipartFile eWayBillData, MultipartFile expenseInvoicesAndVouchers,
			MultipartFile bankStatement, MultipartFile previousGstReturns, MultipartFile previousFilingAcknowledgement,
			MultipartFile otherSupportingDocuments) throws IOException;

	GstFilingDocumentsDto getDocuments(String gstfilingId);

	String updateDocuments(String gstfilingId, MultipartFile salesInvoice, MultipartFile purchaseInvoices,
			MultipartFile gstr2bItcStatement, MultipartFile creditNotes, MultipartFile debitNotes,
			MultipartFile eInvoiceData, MultipartFile eWayBillData, MultipartFile expenseInvoicesAndVouchers,
			MultipartFile bankStatement, MultipartFile previousGstReturns, MultipartFile previousFilingAcknowledgement,
			MultipartFile otherSupportingDocuments) throws IOException;

	String deleteDocuments(String gstfilingId);
}
