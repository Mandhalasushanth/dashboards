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
public class AdditionalPlaceAmendmentDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Additional Place Amendment Details
    private String id;
    private String gstNumber;
    private String address;
    private String city;
    private String pinCode;
    private NatureOfPremises natureOfPremises;
    private byte[] imageData;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;
}
