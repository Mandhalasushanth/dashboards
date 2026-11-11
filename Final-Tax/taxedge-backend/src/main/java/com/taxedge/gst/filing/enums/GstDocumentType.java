package com.taxedge.gst.filing.enums;

import java.util.Arrays;
import java.util.Locale;

public enum GstDocumentType {

	SALES_INVOICE("salesInvoice"), PURCHASE_INVOICES("purchaseInvoices"), GSTR2B_ITC_STATEMENT("gstr2bItcStatement"),
	CREDIT_NOTES("creditNotes"), DEBIT_NOTES("debitNotes"), E_INVOICE_DATA("eInvoiceData"),
	E_WAY_BILL_DATA("eWayBillData"), EXPENSE_INVOICES_AND_VOUCHERS("expenseInvoicesAndVouchers"),
	BANK_STATEMENT("bankStatement"), PREVIOUS_GST_RETURNS("previousGstReturns"),
	PREVIOUS_FILING_ACKNOWLEDGEMENT("previousFilingAcknowledgement"),
	OTHER_SUPPORTING_DOCUMENTS("otherSupportingDocuments");

	private final String value;

	GstDocumentType(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static GstDocumentType from(String value) {

		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("Document type is required");
		}

		String normalizedValue = value.trim().toLowerCase(Locale.ROOT);

		return Arrays.stream(values())
				.filter(documentType -> documentType.value.toLowerCase(Locale.ROOT).equals(normalizedValue)).findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Invalid document type: " + value));
	}
}
