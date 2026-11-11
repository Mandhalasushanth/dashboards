package com.taxedge.dashboards.camanagers.gst.dto;

import java.time.LocalDate;
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
public class SignatoryAmendmentDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Signatory Amendment Details
    private String id;
    private String gstNumber;
    private String newSignatoryName;
    private String newSignatoryPan;
    private LocalDate newSignatoryDob;
    private String newDesignation;
    private String newSignatoryMobile;
    private String newSignatoryEmail;
    private byte[] imageData;
    private RegisterationStatus status;
    private LocalDateTime submittedAt;
}
