package com.taxedge.loan.personalloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.personalloan.enums.ExistingLoanStatus;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.personalloan.enums.NatureOfBusiness;
import com.taxedge.loan.personalloan.enums.PersonalLoanJobType;
import com.taxedge.loan.personalloan.enums.PersonalLoanPurpose;
import com.taxedge.loan.personalloan.helper.PersonalLoanHelper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(
    name = "personal_loan_applications",
    indexes = @Index(
        name = "idx_personal_loan_cust_created",
        columnList = "cust_id, created_at"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalLoanApplication {

    @Id
    @Column(name = "loan_application_id", nullable = false, updatable = false, length = 30)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id",
                foreignKey = @ForeignKey(name = "fk_personal_loan_application_customer"))
    private Customer customer;

    @Column(name = "loan_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal loanAmount;

    @Column(name = "employment_type", length = 30)
    private String employmentType;

    @Column(name = "employer_name", length = 100)
    private String employerName;

    @Column(name = "job_type", length = 50)
    @Enumerated(EnumType.STRING)
    private PersonalLoanJobType jobType;

    @Column(name = "work_experience", length = 50)
    private String workExperience;

    @Column(name = "salary_credit_method", length = 30)
    private String salaryCreditMethod;

    @Column(name = "business_or_profession_name", length = 150)
    private String businessOrProfessionName;

    @Column(name = "nature_of_business", length = 50)
    @Enumerated(EnumType.STRING)
    private NatureOfBusiness natureOfBusiness;

    @Column(name = "average_monthly_income", precision = 15, scale = 2)
    private BigDecimal averageMonthlyIncome;

    @Column(name = "years_in_business", length = 50)
    private String yearsInBusiness;

    @Column(name = "purpose", length = 100)
    private String purpose;

    @Column(name = "purpose_other", length = 255)
    private String purposeOther;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_purpose", length = 40)
    private PersonalLoanPurpose loanPurpose;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "monthly_net_salary", precision = 15, scale = 2)
    private BigDecimal monthlyNetSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "existing_loan_status", length = 30)
    private ExistingLoanStatus existingLoanStatus;

    @Column(name = "primary_bank_name", length = 100)
    private String primaryBankName;

    @Column(name = "account_number", length = 35)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 15)
    private String ifscCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private LoanApplicationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.id == null) {
            this.id = PersonalLoanHelper.generateLoanApplicationId();
        }
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = LoanApplicationStatus.DRAFT;
        }
    }
}
