package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.filing.enums.FilingFrequency;
import com.taxedge.gst.filing.enums.FilingType;
import com.taxedge.gst.filing.enums.ReturnType;
import com.taxedge.gst.filing.enums.TaxCalculationMethod;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstFilingDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Step 1: GST Filing Details
    private String gstfilingId;
    private String gstin;
    private String financialYear;
    private String filingPeriod;
    private FilingFrequency filingFrequency;
    private ReturnType returnType;
    private FilingType filingType;
    private TaxCalculationMethod taxCalculationMethod;
    private Long estimatedTaxableSales;
    private Long estimatedTaxablePurchases;
    private Long estimatedEligibleItc;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;

    // Step 2: GST Filing Documents
    private String documentId;
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
