package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AadhaarVerifyOtpPayload {

    @JsonProperty("@entity")
    @Builder.Default
    private String entity = "in.co.sandbox.kyc.aadhaar.okyc.request";

    @JsonProperty("reference_id")
    private String referenceId;

    private String otp;
}

