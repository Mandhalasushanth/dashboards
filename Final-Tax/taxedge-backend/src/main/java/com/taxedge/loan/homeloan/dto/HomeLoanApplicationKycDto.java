package com.taxedge.loan.homeloan.dto;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeLoanApplicationKycDto {

    private String customerId;

    private String fullLegalName;
    private String mobileNumber;
    private String emailAddress;

    private String panNumber;
    private String aadhaarNumber;
    private LocalDate dateOfBirth;

    private String houseFlatBuilding;
    private String streetLocalityLandmark;
    private String city;
    private String pinCode;
    private String state;
}