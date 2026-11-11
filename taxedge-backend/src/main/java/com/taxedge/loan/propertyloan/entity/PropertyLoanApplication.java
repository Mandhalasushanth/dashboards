package com.taxedge.loan.propertyloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.propertyloan.enums.ConstructionStage;
import com.taxedge.loan.propertyloan.enums.PropertyLoanPurpose;
import com.taxedge.loan.propertyloan.enums.PropertyOwnership;
import com.taxedge.loan.propertyloan.enums.PropertyStatus;
import com.taxedge.loan.propertyloan.enums.PropertyType;
import com.taxedge.loan.propertyloan.enums.RenovationStatus;
import com.taxedge.loan.propertyloan.helper.PropertyLoanHelper;

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
@Table(name = "property_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyLoanApplication {

    @Id
    @Column(name = "loan_application_id", nullable = false, updatable = false, length = 30)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_property_loan_customer"))
    private Customer customer;

    @Column(name = "requested_loan_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal requestedLoanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose_of_loan", length = 40, nullable = false)
    private PropertyLoanPurpose purposeOfLoan;

    @Column(name = "purpose_other", length = 150)
    private String purposeOther;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_status", length = 40)
    private PropertyStatus propertyStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "construction_stage", length = 40)
    private ConstructionStage constructionStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "renovation_status", length = 40)
    private RenovationStatus renovationStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", length = 40, nullable = false)
    private PropertyType propertyType;

    @Column(name = "city", length = 100, nullable = false)
    private String city;

    @Column(name = "state", length = 100, nullable = false)
    private String state;

    @Column(name = "pin_code", length = 10, nullable = false)
    private String pinCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "ownership", length = 30, nullable = false)
    private PropertyOwnership ownership;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private LoanApplicationStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (this.id == null || this.id.isBlank()) {
            this.id = PropertyLoanHelper.generateLoanApplicationId();
        }
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = LoanApplicationStatus.DRAFT;
        }
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
