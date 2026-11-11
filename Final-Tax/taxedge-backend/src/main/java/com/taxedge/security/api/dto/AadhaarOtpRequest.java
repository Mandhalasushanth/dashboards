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
public class AadhaarOtpRequest {

    @JsonProperty("@entity")
    private String entity;

    @JsonProperty("aadhaar_number")
    private String aadhaarNumber;

    private String consent;

    private String reason;
}