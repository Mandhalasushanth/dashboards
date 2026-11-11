package com.taxedge.loan.businessloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "business_loan_banking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessLoanBanking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_application_id", unique = true,
                foreignKey = @ForeignKey(name = "fk_loan_banking_application"))
    private BusinessLoanApplication loanApplication;

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "current_account_number", length = 20)
    private String currentAccountNumber;

    @Column(name = "ifsc_code", length = 11)
    private String ifscCode;

    @Column(name = "current_lender", length = 150)
    private String currentLender;

    @Column(name = "total_active_loan_limit", precision = 15, scale = 2)
    private BigDecimal totalActiveLoanLimit;

    @Column(name = "itr_acknowledgement_number", length = 15)
    private String itrAcknowledgementNumber;

    @Column(name = "gross_total_income", precision = 15, scale = 2)
    private BigDecimal grossTotalIncome;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
