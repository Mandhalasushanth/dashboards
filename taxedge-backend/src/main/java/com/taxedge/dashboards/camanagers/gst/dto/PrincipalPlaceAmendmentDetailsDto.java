package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.NatureOfPremises;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrincipalPlaceAmendmentDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Principal Place Amendment Details
    private String id;
    private String gstNumber;
    private String newBusinessAddress;
    private String newCity;
    private String newDistrict;
    private String newState;
    private String newPinCode;
    private NatureOfPremises natureOfPremises;
    private byte[] imageData;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;
}
