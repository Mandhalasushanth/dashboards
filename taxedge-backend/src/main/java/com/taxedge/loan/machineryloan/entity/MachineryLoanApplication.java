package com.taxedge.loan.machineryloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.machineryloan.enums.BusinessConstitution;
import com.taxedge.loan.machineryloan.enums.BusinessVintage;
import com.taxedge.loan.machineryloan.enums.MachineryCondition;
import com.taxedge.loan.machineryloan.enums.MachineryLoanApplicationStatus;
import com.taxedge.loan.machineryloan.enums.MachineryPurchaseType;
import com.taxedge.loan.machineryloan.enums.MachineryType;
import com.taxedge.loan.machineryloan.helper.MachineryLoanHelper;

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
@Table(name = "machinery_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineryLoanApplication {

    @Id
    @Column(name = "machinery_loan_id", nullable = false, updatable = false, length = 30)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id",
                foreignKey = @ForeignKey(name = "fk_machinery_loan_customer"))
    private Customer customer;

   

    @Column(name = "loan_amount", precision = 15, scale = 2)
    private BigDecimal loanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "machinery_type", length = 40)
    private MachineryType machineryType;

    @Column(name = "machinery_type_other", length = 80)
    private String machineryTypeOther;

    @Column(name = "machinery_name", length = 100)
    private String machineryName;

    @Enumerated(EnumType.STRING)
    @Column(name = "machinery_condition", length = 30)
    private MachineryCondition machineryCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_type", length = 40)
    private MachineryPurchaseType purchaseType;

    @Column(name = "purchase_type_other", length = 80)
    private String purchaseTypeOther;

    @Column(name = "approximate_machinery_cost", precision = 15, scale = 2)
    private BigDecimal approximateMachineryCost;

    @Column(name = "dealer_name", length = 100)
    private String dealerName;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

   

    @Column(name = "business_name", length = 300)
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", length = 30)
    private BusinessConstitution businessType;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_vintage", length = 30)
    private BusinessVintage businessVintage;

    @Column(name = "annual_turnover", precision = 15, scale = 2)
    private BigDecimal annualTurnover;

    @Column(name = "gst_registered")
    private Boolean gstRegistered;

    @Column(name = "gstin", length = 15)
    private String gstin;

  

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "current_account_number", length = 30)
    private String currentAccountNumber;

    @Column(name = "ifsc_code", length = 11)
    private String ifscCode;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private MachineryLoanApplicationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (this.id == null) {
            this.id = MachineryLoanHelper.generateMachineryLoanApplicationId();
        }
        this.createdAt = LocalDateTime.now();
        this.status = MachineryLoanApplicationStatus.DRAFT;
    }
}
