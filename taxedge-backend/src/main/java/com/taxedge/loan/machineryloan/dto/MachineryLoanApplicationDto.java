package com.taxedge.loan.machineryloan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxedge.loan.machineryloan.enums.BusinessConstitution;
import com.taxedge.loan.machineryloan.enums.BusinessVintage;
import com.taxedge.loan.machineryloan.enums.MachineryCondition;
import com.taxedge.loan.machineryloan.enums.MachineryLoanApplicationStatus;
import com.taxedge.loan.machineryloan.enums.MachineryPurchaseType;
import com.taxedge.loan.machineryloan.enums.MachineryType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MachineryLoanApplicationDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

  
    @NotNull(message = "Requested loan amount is required")
    @DecimalMin(value = "0.01", message = "Requested loan amount must be greater than zero")
    private BigDecimal loanAmount;

    @NotNull(message = "Machinery type is required")
    private MachineryType machineryType;

    private String machineryTypeOther;

    @NotBlank(message = "Machinery name is required")
    private String machineryName;

    @NotNull(message = "Machinery condition is required")
    private MachineryCondition machineryCondition;

    @NotNull(message = "Purchase type is required")
    private MachineryPurchaseType purchaseType;

    private String purchaseTypeOther;

    @NotNull(message = "Approximate machinery cost is required")
    @DecimalMin(value = "0.01", message = "Approximate machinery cost must be greater than zero")
    private BigDecimal approximateMachineryCost;
    private String dealerName;
    private Integer tenureMonths;


    private String businessName;
    private BusinessConstitution businessType;
    private BusinessVintage businessVintage;
    private BigDecimal annualTurnover;
    private Boolean gstRegistered;
    private String gstin;


    private String bankName;
    private String currentAccountNumber;
    private String ifscCode;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private MachineryLoanApplicationStatus status;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;
}
