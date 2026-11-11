
package com.taxedge.loan.homeloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.homeloan.enums.HomeLoanRequirementPropertyStatus;
import com.taxedge.loan.homeloan.enums.HomeLoanRequirementPurpose;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "home_loan_requirement_applications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeLoanRequirementApplication {

    @Id
    @Column(name = "home_loan_id", nullable = false, length = 50)
    private String homeLoanId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", nullable = false)
    private Customer customer;

    @Column(
            name = "requested_loan_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal requestedLoanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "loan_purpose", nullable = false, length = 50)
    private HomeLoanRequirementPurpose loanPurpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_status", nullable = false, length = 50)
    private HomeLoanRequirementPropertyStatus propertyStatus;

    @Column(
            name = "approximate_property_value",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal approximatePropertyValue;

    @Builder.Default
    @Column(name = "application_status", nullable = false, length = 30)
    private String applicationStatus = "DRAFT";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
