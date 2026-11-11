package com.taxedge.loan.personalloan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.taxedge.loan.personalloan.enums.ExistingLoanStatus;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.personalloan.enums.NatureOfBusiness;
import com.taxedge.loan.personalloan.enums.PersonalLoanJobType;
import com.taxedge.loan.personalloan.enums.PersonalLoanPurpose;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalLoanApplicationDto {

    private String id;

    private String custId;

    @NotNull
    @DecimalMin(value = "10000.00", message = "Loan amount must be at least 10000")
    @DecimalMax(value = "10000000.00", message = "Loan amount must not exceed 10000000")
    @Digits(integer = 8, fraction = 0, message = "Loan amount must be a whole number")
    private BigDecimal loanAmount;

    @NotBlank
    @Size(max = 20)
    private String employmentType;

    @Size(max = 100)
    private String employerName;

    private PersonalLoanJobType jobType;

    @Size(max = 50)
    private String workExperience;

    @Size(max = 30)
    private String salaryCreditMethod;

    @Size(max = 150)
    private String businessOrProfessionName;

    private NatureOfBusiness natureOfBusiness;

    @DecimalMin(value = "0.00")
    private BigDecimal averageMonthlyIncome;

    @Size(max = 50)
    private String yearsInBusiness;

    private PersonalLoanPurpose loanPurpose;

    private Integer tenureMonths;

    @DecimalMin(value = "0.00")
    private BigDecimal monthlyNetSalary;

    @Size(max = 100)
    private String purpose;

    @Size(max = 255)
    private String purposeOther;

    private ExistingLoanStatus existingLoanStatus;

    private String primaryBankName;

    private String accountNumber;

    private String ifscCode;

    private LoanApplicationStatus status;

    private LocalDateTime createdAt;
}
