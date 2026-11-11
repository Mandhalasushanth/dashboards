package com.taxedge.gst.amendment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SignatoryAmendmentViewDto {
    private String id;
    private String newSignatoryName;
    private String newSignatoryPan;
    private LocalDate newSignatoryDob;
    private String newDesignation;
    private String newSignatoryDesignation;
    private String designation;
    private String newSignatoryMobile;
    private String newSignatoryEmail;
    private byte[] imageData;
    private String businessGstId;
    private String gstNumber;
    private String customerId;

    @Builder.Default
    private RegisterationStatus status = RegisterationStatus.DRAFT;
}
