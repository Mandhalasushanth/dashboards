package com.taxedge.loan.vehicleloan.dto;

import java.math.BigDecimal;

import com.taxedge.loan.vehicleloan.enums.DealerSelection;
import com.taxedge.loan.vehicleloan.enums.PurchaseTimeline;
import com.taxedge.loan.vehicleloan.enums.RegistrationState;
import com.taxedge.loan.vehicleloan.enums.VehicleCategory;
import com.taxedge.loan.vehicleloan.enums.VehicleCondition;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
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
public class VehicleLoanUpdateRequest {

    @DecimalMin("0.01")
    private BigDecimal requestedLoanAmount;

    private VehicleCondition vehicleCondition;

    private VehicleCategory vehicleCategory;

    @Size(max = 100)
    private String vehicleMake;

    @Size(max = 100)
    private String vehicleModel;

    @DecimalMin("0.01")
    private BigDecimal approximateVehiclePrice;

    private DealerSelection dealerSelected;

    @Size(max = 150)
    private String dealerName;

    private PurchaseTimeline purchaseTimeline;

    private RegistrationState registrationState;
}
