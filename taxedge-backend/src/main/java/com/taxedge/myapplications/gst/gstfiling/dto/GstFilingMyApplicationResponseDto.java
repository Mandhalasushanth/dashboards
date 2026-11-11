package com.taxedge.myapplications.gst.gstfiling.dto;

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
public class GstFilingMyApplicationResponseDto {

    private String gstfilingId;
    private String gstin;
    private String applicationType;
    private RegisterationStatus status;
    private Long assignedAgentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Step 1: Return Details
    private String financialYear;
    private String filingPeriod;
    private FilingFrequency filingFrequency;
    private ReturnType returnType;
    private FilingType filingType;
    private TaxCalculationMethod taxCalculationMethod;
    private Long estimatedTaxableSales;
    private Long estimatedTaxablePurchases;
    private Long estimatedEligibleItc;

    // Step 2: Documents Flags
    private String documentId;
    private boolean salesInvoiceUploaded;
    private boolean purchaseInvoicesUploaded;
    private boolean gstr2bItcStatementUploaded;
    private boolean creditNotesUploaded;
    private boolean debitNotesUploaded;
    private boolean eInvoiceDataUploaded;
    private boolean eWayBillDataUploaded;
    private boolean expenseInvoicesAndVouchersUploaded;
    private boolean bankStatementUploaded;
    private boolean previousGstReturnsUploaded;
    private boolean previousFilingAcknowledgementUploaded;
    private boolean otherSupportingDocumentsUploaded;
}
