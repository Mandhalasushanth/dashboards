package com.taxedge.loan.vehicleloan.dto;

import java.time.LocalDateTime;

import com.taxedge.loan.vehicleloan.enums.VehicleLoanApplicationStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLoanApplicationDto {

    private String vehicleLoanId;

    private String customerId;

    private VehicleLoanApplicationStatus applicationStatus;

    private LocalDateTime createdAt;
}