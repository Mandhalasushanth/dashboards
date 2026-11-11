package com.taxedge.gst.filing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstFilingDocumentsDto {

    private String documentId;

    private String filingId;

    private byte[] salesInvoice;

    private byte[] purchaseInvoices;

    private byte[] gstr2bItcStatement;

    private byte[] creditNotes;

    private byte[] debitNotes;

    private byte[] eInvoiceData;

    private byte[] eWayBillData;

    private byte[] expenseInvoicesAndVouchers;

    private byte[] bankStatement;

    private byte[] previousGstReturns;

    private byte[] previousFilingAcknowledgement;

    private byte[] otherSupportingDocuments;
}
