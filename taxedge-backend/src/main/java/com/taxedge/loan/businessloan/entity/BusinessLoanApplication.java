package com.taxedge.loan.businessloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.businessloan.enums.EmploymentProfile;
import com.taxedge.loan.businessloan.enums.ExistingLoanStatus;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;
import com.taxedge.loan.businessloan.enums.LoanPurpose;
import com.taxedge.loan.businessloan.helper.BusinessLoanHelper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
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
@Table(name = "business_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLoanApplication {

    @Id
    @Column(name = "loan_application_id", nullable = false, updatable = false, length = 30)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id",
                foreignKey = @ForeignKey(name = "fk_loan_application_customer"))
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_profile", length = 30)
    private EmploymentProfile employmentProfile;

    @Column(name = "loan_amount", precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Column(name = "project_cost", precision = 15, scale = 2)
    private BigDecimal projectCost;

    @Column(name = "loan_purpose_other", length = 120)
    private String loanPurposeOther;

    @Column(name = "loan_purpose_description", length = 1000)
    private String loanPurposeDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_purpose", length = 40)
    private LoanPurpose loanPurpose;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "annual_turnover")
    private BigDecimal annualTurnover;

    @Column(name = "monthly_sales", precision = 15, scale = 2)
    private BigDecimal monthlySales;

    @Column(name = "monthly_expenses", precision = 15, scale = 2)
    private BigDecimal monthlyExpenses;

    @Enumerated(EnumType.STRING)
    @Column(name = "existing_loan_status", length = 30)
    private ExistingLoanStatus existingLoanStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private LoanApplicationStatus status;

   

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_activity_at", nullable = false)
    private LocalDateTime lastActivityAt;

    @PrePersist
    void onCreate() {
        if (this.id == null) {
            this.id = BusinessLoanHelper.generateLoanApplicationId();
        }
        this.createdAt = LocalDateTime.now();
        this.lastActivityAt = this.createdAt;
        this.status = LoanApplicationStatus.DRAFT;
    }

    @jakarta.persistence.PreUpdate
    void onUpdate() {
        this.lastActivityAt = LocalDateTime.now();
    }
}
