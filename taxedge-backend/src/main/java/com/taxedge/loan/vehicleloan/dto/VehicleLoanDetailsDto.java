package com.taxedge.loan.vehicleloan.dto;

import java.math.BigDecimal;

import com.taxedge.loan.vehicleloan.enums.DealerSelection;
import com.taxedge.loan.vehicleloan.enums.PurchaseTimeline;
import com.taxedge.loan.vehicleloan.enums.RegistrationState;
import com.taxedge.loan.vehicleloan.enums.VehicleCategory;
import com.taxedge.loan.vehicleloan.enums.VehicleCondition;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLoanDetailsDto {

    private String vehicleLoanDetailsId;
    private String vehicleLoanId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal requestedLoanAmount;

    @NotNull
    private VehicleCondition vehicleCondition;

    @NotNull
    private VehicleCategory vehicleCategory;

    @NotBlank
    @Size(max = 100)
    private String vehicleMake;

    @NotBlank
    @Size(max = 100)
    private String vehicleModel;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal approximateVehiclePrice;

    @NotNull
    private DealerSelection dealerSelected;

    @Size(max = 150)
    private String dealerName;

    @NotNull
    private PurchaseTimeline purchaseTimeline;

    @NotNull
    private RegistrationState registrationState;
}