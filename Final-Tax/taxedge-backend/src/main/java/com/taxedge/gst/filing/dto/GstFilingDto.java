package com.taxedge.gst.filing.dto;

import com.taxedge.gst.filing.enums.FilingFrequency;
import com.taxedge.gst.filing.enums.FilingType;
import com.taxedge.gst.filing.enums.ReturnType;
import com.taxedge.gst.filing.enums.TaxCalculationMethod;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstFilingDto {

    @NotBlank(message = "GSTIN is required")
    private String gstin;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotBlank(message = "Financial year is required")
    private String financialYear;

    @NotBlank(message = "Filing period is required")
    private String filingPeriod;

    @NotNull(message = "Filing frequency is required")
    private FilingFrequency filingFrequency;

    @NotNull(message = "Return type is required")
    private ReturnType returnType;

    @NotNull(message = "Filing type is required")
    private FilingType filingType;

    private TaxCalculationMethod taxCalculationMethod;

    @PositiveOrZero(message = "Estimated taxable sales cannot be negative")
    private Long estimatedTaxableSales;

    @PositiveOrZero(message = "Estimated taxable purchases cannot be negative")
    private Long estimatedTaxablePurchases;

    @PositiveOrZero(message = "Estimated eligible ITC cannot be negative")
    private Long estimatedEligibleItc;
    
    @Builder.Default
    private RegisterationStatus status = RegisterationStatus.DRAFT;
}
