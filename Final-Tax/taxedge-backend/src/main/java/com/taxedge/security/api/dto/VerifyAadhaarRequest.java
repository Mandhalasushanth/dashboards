package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
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
public class VerifyAadhaarRequest {

    @JsonProperty("aadhaar_number")
    @JsonAlias({"aadhaarNumber", "aadhaar", "aadhaar_no"})
    private String aadhaarNumber;
}
