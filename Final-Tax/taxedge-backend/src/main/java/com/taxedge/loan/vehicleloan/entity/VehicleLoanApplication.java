package com.taxedge.loan.vehicleloan.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.customer.entity.Customer;
import com.taxedge.loan.vehicleloan.enums.DealerSelection;
import com.taxedge.loan.vehicleloan.enums.PurchaseTimeline;
import com.taxedge.loan.vehicleloan.enums.RegistrationState;
import com.taxedge.loan.vehicleloan.enums.VehicleCategory;
import com.taxedge.loan.vehicleloan.enums.VehicleCondition;
import com.taxedge.loan.vehicleloan.enums.VehicleLoanApplicationStatus;

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
@Table(name = "vehicle_loan_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLoanApplication {

    @Id
    @Column(
            name = "vehicle_loan_id",
            length = 50,
            nullable = false,
            updatable = false
    )
    private String vehicleLoanId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "cust_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_vehicle_loan_customer")
    )
    private Customer customer;

    @Column(name = "requested_loan_amount", precision = 15, scale = 2)
    private BigDecimal requestedLoanAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_condition", length = 30)
    private VehicleCondition vehicleCondition;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_category", length = 40)
    private VehicleCategory vehicleCategory;

    @Column(name = "vehicle_make", length = 100)
    private String vehicleMake;

    @Column(name = "vehicle_model", length = 100)
    private String vehicleModel;

    @Column(name = "approximate_vehicle_price", precision = 15, scale = 2)
    private BigDecimal approximateVehiclePrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "dealer_selected", length = 10)
    private DealerSelection dealerSelected;

    @Column(name = "dealer_name", length = 150)
    private String dealerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_timeline", length = 30)
    private PurchaseTimeline purchaseTimeline;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_state", length = 60)
    private RegistrationState registrationState;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_status", nullable = false, length = 30)
    @Builder.Default
    private VehicleLoanApplicationStatus applicationStatus = VehicleLoanApplicationStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (applicationStatus == null) {
            applicationStatus = VehicleLoanApplicationStatus.DRAFT;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
