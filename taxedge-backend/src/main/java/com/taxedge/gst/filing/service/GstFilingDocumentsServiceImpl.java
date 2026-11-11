package com.taxedge.gst.filing.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.filing.dto.GstFilingDocumentsDto;
import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.entity.GstFilingDocuments;
import com.taxedge.gst.filing.enums.GstDocumentType;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.filing.mapper.GstFilingDocumentsMapper;
import com.taxedge.gst.filing.repository.GstFilingDocumentsRepository;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.validator.GstFileUploadValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class GstFilingDocumentsServiceImpl implements GstFilingDocumentsService {

	private final GstFilingDocumentsRepository documentsRepository;

	private final GstFilingRepository filingRepository;

	private final GstFilingDocumentsMapper documentsMapper;

	private final GstFileUploadValidator fileUploadValidator;

	@Override
	public String uploadDocuments(String gstfilingId, MultipartFile salesInvoice, MultipartFile purchaseInvoices,
			MultipartFile gstr2bItcStatement, MultipartFile creditNotes, MultipartFile debitNotes,
			MultipartFile eInvoiceData, MultipartFile eWayBillData, MultipartFile expenseInvoicesAndVouchers,
			MultipartFile bankStatement, MultipartFile previousGstReturns, MultipartFile previousFilingAcknowledgement,
			MultipartFile otherSupportingDocuments) throws IOException {

		GstFiling filing = getFiling(gstfilingId);

		validateAtLeastOneDocument(salesInvoice, purchaseInvoices, gstr2bItcStatement, creditNotes, debitNotes,
				eInvoiceData, eWayBillData, expenseInvoicesAndVouchers, bankStatement, previousGstReturns,
				previousFilingAcknowledgement, otherSupportingDocuments);

		if (documentsRepository.existsByGstFiling_GstfilingId(gstfilingId)) {
			return updateDocuments(gstfilingId, salesInvoice, purchaseInvoices, gstr2bItcStatement, creditNotes,
					debitNotes, eInvoiceData, eWayBillData, expenseInvoicesAndVouchers, bankStatement,
					previousGstReturns, previousFilingAcknowledgement, otherSupportingDocuments);
		}

		GstFilingDocumentsDto dto = GstFilingDocumentsDto.builder().filingId(gstfilingId)
				.salesInvoice(storeFile(salesInvoice, "salesInvoice"))
				.purchaseInvoices(storeFile(purchaseInvoices, "purchaseInvoices"))
				.gstr2bItcStatement(storeFile(gstr2bItcStatement, "gstr2bItcStatement"))
				.creditNotes(storeFile(creditNotes, "creditNotes")).debitNotes(storeFile(debitNotes, "debitNotes"))
				.eInvoiceData(storeFile(eInvoiceData, "eInvoiceData"))
				.eWayBillData(storeFile(eWayBillData, "eWayBillData"))
				.expenseInvoicesAndVouchers(storeFile(expenseInvoicesAndVouchers, "expenseInvoicesAndVouchers"))
				.bankStatement(storeFile(bankStatement, "bankStatement"))
				.previousGstReturns(storeFile(previousGstReturns, "previousGstReturns"))
				.previousFilingAcknowledgement(
						storeFile(previousFilingAcknowledgement, "previousFilingAcknowledgement"))
				.otherSupportingDocuments(storeFile(otherSupportingDocuments, "otherSupportingDocuments")).build();

		GstFilingDocuments documents = documentsMapper.toEntity(dto);

		documents.setDocumentId(generateDocumentId());

		documents.setGstFiling(filing);

		documentsRepository.save(documents);

		return "GST filing documents uploaded successfully. Document ID: " + documents.getDocumentId();
	}

	@Override
	@Transactional(readOnly = true)
	public GstFilingDocumentsDto getDocuments(String gstfilingId) {

		GstFilingDocuments documents = documentsRepository.findByGstFiling_GstfilingId(gstfilingId)
				.or(() -> documentsRepository.findById(gstfilingId))
				.orElseThrow(() -> new ResourceNotFoundException("GST filing documents not found for ID: " + gstfilingId));

		return documentsMapper.toDto(documents);
	}

	@Override
	public String updateDocuments(String gstfilingId, MultipartFile salesInvoice, MultipartFile purchaseInvoices,
			MultipartFile gstr2bItcStatement, MultipartFile creditNotes, MultipartFile debitNotes,
			MultipartFile eInvoiceData, MultipartFile eWayBillData, MultipartFile expenseInvoicesAndVouchers,
			MultipartFile bankStatement, MultipartFile previousGstReturns, MultipartFile previousFilingAcknowledgement,
			MultipartFile otherSupportingDocuments) throws IOException {

		getFiling(gstfilingId);

		validateAtLeastOneDocument(salesInvoice, purchaseInvoices, gstr2bItcStatement, creditNotes, debitNotes,
				eInvoiceData, eWayBillData, expenseInvoicesAndVouchers, bankStatement, previousGstReturns,
				previousFilingAcknowledgement, otherSupportingDocuments);

		GstFilingDocuments documents = documentsRepository.findByGstFiling_GstfilingId(gstfilingId).orElseThrow(
				() -> new ResourceNotFoundException("GST filing documents not found for filing ID: " + gstfilingId));

		updateFile(documents, salesInvoice, "salesInvoice");

		updateFile(documents, purchaseInvoices, "purchaseInvoices");

		updateFile(documents, gstr2bItcStatement, "gstr2bItcStatement");

		updateFile(documents, creditNotes, "creditNotes");

		updateFile(documents, debitNotes, "debitNotes");

		updateFile(documents, eInvoiceData, "eInvoiceData");

		updateFile(documents, eWayBillData, "eWayBillData");

		updateFile(documents, expenseInvoicesAndVouchers, "expenseInvoicesAndVouchers");

		updateFile(documents, bankStatement, "bankStatement");

		updateFile(documents, previousGstReturns, "previousGstReturns");

		updateFile(documents, previousFilingAcknowledgement, "previousFilingAcknowledgement");

		updateFile(documents, otherSupportingDocuments, "otherSupportingDocuments");

		documentsRepository.save(documents);

		return "GST filing documents updated successfully. Document ID: " + documents.getDocumentId();
	}

	@Override
	public String deleteDocuments(String gstfilingId) {

		getFiling(gstfilingId);

		GstFilingDocuments documents = documentsRepository.findByGstFiling_GstfilingId(gstfilingId).orElseThrow(
				() -> new ResourceNotFoundException("GST filing documents not found for filing ID: " + gstfilingId));

		documentsRepository.delete(documents);

		return "GST filing documents deleted successfully";
	}

	private GstFiling getFiling(String gstfilingId) {

		return filingRepository.findById(gstfilingId)
				.orElseThrow(() -> new ResourceNotFoundException("GST filing not found with ID: " + gstfilingId));
	}

	private byte[] storeFile(MultipartFile file, String documentType) throws IOException {

		if (file == null || file.isEmpty()) {
			return null;
		}

		fileUploadValidator.validate(file, documentType);

		return file.getBytes();
	}

	private void updateFile(GstFilingDocuments documents, MultipartFile file, String documentType) throws IOException {

		if (file == null || file.isEmpty()) {
			return;
		}

		fileUploadValidator.validate(file, documentType);

		byte[] data = file.getBytes();

		GstDocumentType type = GstDocumentType.from(documentType);

		switch (type) {
		case SALES_INVOICE -> documents.setSalesInvoice(data);
		case PURCHASE_INVOICES -> documents.setPurchaseInvoices(data);
		case GSTR2B_ITC_STATEMENT -> documents.setGstr2bItcStatement(data);
		case CREDIT_NOTES -> documents.setCreditNotes(data);
		case DEBIT_NOTES -> documents.setDebitNotes(data);
		case E_INVOICE_DATA -> documents.setEInvoiceData(data);
		case E_WAY_BILL_DATA -> documents.setEWayBillData(data);
		case EXPENSE_INVOICES_AND_VOUCHERS -> documents.setExpenseInvoicesAndVouchers(data);
		case BANK_STATEMENT -> documents.setBankStatement(data);
		case PREVIOUS_GST_RETURNS -> documents.setPreviousGstReturns(data);
		case PREVIOUS_FILING_ACKNOWLEDGEMENT -> documents.setPreviousFilingAcknowledgement(data);
		case OTHER_SUPPORTING_DOCUMENTS -> documents.setOtherSupportingDocuments(data);
		}
	}

	private void validateAtLeastOneDocument(MultipartFile salesInvoice, MultipartFile purchaseInvoices,
			MultipartFile gstr2bItcStatement, MultipartFile creditNotes, MultipartFile debitNotes,
			MultipartFile eInvoiceData, MultipartFile eWayBillData, MultipartFile expenseInvoicesAndVouchers,
			MultipartFile bankStatement, MultipartFile previousGstReturns, MultipartFile previousFilingAcknowledgement,
			MultipartFile otherSupportingDocuments) {

		if (isEmpty(salesInvoice) && isEmpty(purchaseInvoices) && isEmpty(gstr2bItcStatement) && isEmpty(creditNotes)
				&& isEmpty(debitNotes) && isEmpty(eInvoiceData) && isEmpty(eWayBillData)
				&& isEmpty(expenseInvoicesAndVouchers) && isEmpty(bankStatement) && isEmpty(previousGstReturns)
				&& isEmpty(previousFilingAcknowledgement) && isEmpty(otherSupportingDocuments)) {

			throw new IllegalArgumentException("Please select at least one document");
		}
	}

	private boolean isEmpty(MultipartFile file) {

		return file == null || file.isEmpty();
	}

	private String generateDocumentId() {

		return "DOC" + UUID.randomUUID().toString().replace("-", "");
	}
}
