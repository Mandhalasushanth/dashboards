package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDateTime;

import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactAmendmentDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Contact Amendment Details
    private String id;
    private String gstNumber;
    private String newMobileNumber;
    private String newEmail;
    private byte[] imageData;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;
}
