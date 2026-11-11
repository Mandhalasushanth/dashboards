package com.taxedge.loan.businessloan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.businessloan.enums.EmploymentProfile;
import com.taxedge.loan.businessloan.enums.ExistingLoanStatus;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;
import com.taxedge.loan.businessloan.enums.LoanPurpose;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLoanApplicationDto {

    private String id;

    private String custId;

    private EmploymentProfile employmentProfile;

    private BigDecimal loanAmount;

    private BigDecimal projectCost;

    private String loanPurposeOther;

    private String loanPurposeDescription;

    private LoanPurpose loanPurpose;

    private Integer tenureMonths;

    private BigDecimal annualTurnover;

    private BigDecimal monthlySales;

    private BigDecimal monthlyExpenses;

    private ExistingLoanStatus existingLoanStatus;

    private LoanApplicationStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime lastActivityAt;

    private BusinessLoanProfileDto businessProfile;
}
