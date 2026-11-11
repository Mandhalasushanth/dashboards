package com.taxedge.loan.businessloan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLoanBankingDto {

    private Long id;

    private String loanApplicationId;

    private String bankName;
    private String currentAccountNumber;
    private String ifscCode;

    private String currentLender;
    private BigDecimal totalActiveLoanLimit;

    private String itrAcknowledgementNumber;
    private BigDecimal grossTotalIncome;

    private LocalDateTime createdAt;
}
