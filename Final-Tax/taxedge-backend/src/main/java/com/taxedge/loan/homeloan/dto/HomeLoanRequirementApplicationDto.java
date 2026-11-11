
package com.taxedge.loan.homeloan.dto;

import java.math.BigDecimal;

import com.taxedge.loan.homeloan.enums.HomeLoanRequirementPropertyStatus;
import com.taxedge.loan.homeloan.enums.HomeLoanRequirementPurpose;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HomeLoanRequirementApplicationDto {


    private String homeLoanId;
    private String applicationStatus;

    @NotNull(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Requested loan amount is required")
    @Positive(message = "Requested loan amount must be greater than zero")
    private BigDecimal requestedLoanAmount;

    @NotNull(message = "Loan purpose is required")
    private HomeLoanRequirementPurpose loanPurpose;

    @NotNull(message = "Property status is required")
    private HomeLoanRequirementPropertyStatus propertyStatus;

    @NotNull(message = "Approximate property value is required")
    @DecimalMin(
            value = "0.01",
            message = "Approximate property value must be greater than zero"
    )
    private BigDecimal approximatePropertyValue;
}
