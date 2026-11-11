package com.taxedge.gst.filing.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gst_filing_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstFilingDocuments {

	@Id
	@Column(name = "document_id", nullable = false, unique = true)
	private String documentId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "filing_id", nullable = false, unique = true)
	private GstFiling gstFiling;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "sales_invoice", columnDefinition = "bytea")
	private byte[] salesInvoice;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "purchase_invoices", columnDefinition = "bytea")
	private byte[] purchaseInvoices;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "gstr2b_itc_statement", columnDefinition = "bytea")
	private byte[] gstr2bItcStatement;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "credit_notes", columnDefinition = "bytea")
	private byte[] creditNotes;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "debit_notes", columnDefinition = "bytea")
	private byte[] debitNotes;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "e_invoice_data", columnDefinition = "bytea")
	private byte[] eInvoiceData;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "e_way_bill_data", columnDefinition = "bytea")
	private byte[] eWayBillData;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "expense_invoices_and_vouchers", columnDefinition = "bytea")
	private byte[] expenseInvoicesAndVouchers;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "bank_statement", columnDefinition = "bytea")
	private byte[] bankStatement;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "previous_gst_returns", columnDefinition = "bytea")
	private byte[] previousGstReturns;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "previous_filing_acknowledgement", columnDefinition = "bytea")
	private byte[] previousFilingAcknowledgement;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "other_supporting_documents", columnDefinition = "bytea")
	private byte[] otherSupportingDocuments;
}
