package com.taxedge.loan.vehicleloan.dto;

import java.time.LocalDate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleLoanKycResponseDto {


    private String customerId;

    private String fullLegalName;
    private String mobileNumber;
    private String emailAddress;
    private String panNumber;
    private String aadhaarNumber;
    private LocalDate dateOfBirth;

    private String houseOrBuilding;
    private String streetOrLocality;
    private String cityOrDistrict;
    private String pinCode;
    private String state;
}