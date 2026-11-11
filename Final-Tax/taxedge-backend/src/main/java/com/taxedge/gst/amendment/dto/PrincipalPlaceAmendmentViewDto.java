package com.taxedge.gst.amendment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PrincipalPlaceAmendmentViewDto {

    private String id;
    private String newBusinessAddress;
    private String newCity;
    private String newDistrict;
    private String newState;
    private String newPinCode;
    private NatureOfPremises natureOfPremises;
    private byte[] imageData;
    private String businessGstId;
    private String gstNumber;
    private String customerId;

    @Builder.Default
    private RegisterationStatus status = RegisterationStatus.DRAFT;
}
