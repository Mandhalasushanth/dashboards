package com.taxedge.loan.businessloan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.businessloan.enums.BusinessConstitution;
import com.taxedge.loan.businessloan.enums.BusinessVintage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLoanProfileDto {

    private Long id;

    private String loanApplicationId;

    private String firmName;
    private String establishmentDate;
    private String businessAddress;
    private String businessActivity;
    private String businessActivityOther;
    private String businessConstitutionOther;
    private String pincode;
    private BusinessConstitution businessConstitution;
    private String gstin;
    private Boolean hasUdyamRegistration;
    private String udyamRegistrationNumber;
    private BusinessVintage businessVintage;
    private BigDecimal annualTurnover;
    private BigDecimal annualNetProfit;

    private String signatoryName;
    private String signatoryDesignation;
    private String signatoryEmail;

    private LocalDateTime createdAt;
}
