package com.taxedge.dashboards.camanagers.itr.dto;

import java.time.LocalDateTime;

import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.filing.enums.AssetType;
import com.taxedge.itr.filing.enums.PropertyClassification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItrFilingDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Step 1: ITR Filing Basic / Bank Details
    private String itrId;
    private String assessmentYear;
    private String residentialStatus;
    private String filingType;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private RegisterationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    // Step 2: Salary / Income Details
    private String incomeId;
    private String incomeSource;
    private String employerLegalName;
    private String grossSalary;
    private String exemptAllowances;
    private String tdsDeductedByEmployer;
    private PropertyClassification propertyClassification;
    private String homeLoanInterestPaid;
    private String annualRentReceived;
    private String municipalTaxesPaid;
    private String howDoYouReportThisBusiness;
    private String grossTurnover;
    private String declaredNetProfit;
    private AssetType assetType;
    private String shortTermGains;
    private String longTermGains;
    private String savingsInterest;
    private String fdTermInterest;
    private String dividendIncome;
    private String otherMiscellaneous;

    // Step 3: ITR Documents (Byte Arrays)
    private String documentId;
    private byte[] form16PartAPartB;
    private byte[] form26as;
    private byte[] aisTis;
    private byte[] bankAccountStatement;
    private byte[] salaryPayslips;
    private byte[] capitalGainsStatement;
    private byte[] businessTurnover;
}

