package com.taxedge.loan.msmeloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.msmeloan.enums.MsmeBusinessActivity;
import com.taxedge.loan.msmeloan.enums.MsmeConstitution;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "msme_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MsmeLoanApplication {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 30)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_msme_loan_customer"))
    private Customer customer;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(name = "constitution", length = 30)
    private MsmeConstitution constitution;

    @Column(name = "constitution_other", length = 50)
    private String constitutionOther;

    @Enumerated(EnumType.STRING)
    @Column(name = "business_activity", length = 30)
    private MsmeBusinessActivity businessActivity;

    @Column(name = "business_activity_other", length = 60)
    private String businessActivityOther;

    @Column(name = "requested_loan_amount", precision = 15, scale = 2)
    private BigDecimal requestedLoanAmount;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "annual_turnover", precision = 15, scale = 2)
    private BigDecimal annualTurnover;

    @Column(name = "years_in_business", length = 50)
    private String yearsInBusiness;

    @Column(name = "establishment_date", length = 10)
    private String establishmentDate;

    @Column(name = "operating_address_house_number", length = 100)
    private String operatingAddressHouseNumber;

    @Column(name = "operating_address_street", length = 120)
    private String operatingAddressStreet;

    @Column(name = "operating_address_city", length = 50)
    private String operatingAddressCity;

    @Column(name = "operating_address_state", length = 100)
    private String operatingAddressState;

    @Column(name = "operating_address_pincode", length = 6)
    private String operatingAddressPincode;

    @Column(name = "number_of_employees", length = 10)
    private String numberOfEmployees;

    @Column(name = "ownership_type", length = 40)
    private String ownershipType;

    @Column(name = "ownership_type_other", length = 50)
    private String ownershipTypeOther;

    @Column(name = "udyam_status", length = 30)
    private String udyamStatus;

    @Column(name = "gst_status", length = 30)
    private String gstStatus;

    @Column(name = "udyam_registration_number", length = 30)
    private String udyamRegistrationNumber;

    @Column(name = "gstin", length = 15)
    private String gstin;

    @Column(name = "pan_number", length = 10)
    private String panNumber;

    @Column(name = "primary_bank_name", length = 100)
    private String primaryBankName;

    @Column(name = "account_number", length = 30)
    private String accountNumber;

    @Column(name = "ifsc_code", length = 11)
    private String ifscCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private LoanApplicationStatus status = LoanApplicationStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) {
            this.status = LoanApplicationStatus.DRAFT;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
