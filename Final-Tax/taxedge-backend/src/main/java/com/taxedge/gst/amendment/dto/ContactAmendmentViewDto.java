package com.taxedge.gst.amendment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContactAmendmentViewDto {
    private String id;
    private String newMobileNumber;
    private String newEmail;
    private byte[] imageData;
    private String businessGstId;
    private String gstNumber;
    private String customerId;

    @Builder.Default
    private RegisterationStatus status = RegisterationStatus.DRAFT;
}
