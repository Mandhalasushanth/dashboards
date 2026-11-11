package com.taxedge.loan.vehicleloan.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.taxedge.loan.vehicleloan.enums.DealerSelection;
import com.taxedge.loan.vehicleloan.enums.PurchaseTimeline;
import com.taxedge.loan.vehicleloan.enums.RegistrationState;
import com.taxedge.loan.vehicleloan.enums.VehicleCategory;
import com.taxedge.loan.vehicleloan.enums.VehicleCondition;
import com.taxedge.loan.vehicleloan.enums.VehicleLoanApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLoanResponse {

    private String vehicleLoanId;
    private String customerId;
    private VehicleLoanApplicationStatus applicationStatus;

    private BigDecimal requestedLoanAmount;
    private VehicleCondition vehicleCondition;
    private VehicleCategory vehicleCategory;
    private String vehicleMake;
    private String vehicleModel;
    private BigDecimal approximateVehiclePrice;
    private DealerSelection dealerSelected;
    private String dealerName;
    private PurchaseTimeline purchaseTimeline;
    private RegistrationState registrationState;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
