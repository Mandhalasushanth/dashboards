package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class IfscVerificationResponse {

    @JsonProperty("IFSC")
    private String ifsc;

    @JsonProperty("BANK")
    private String bank;

    @JsonProperty("BANKCODE")
    private String bankCode;

    @JsonProperty("BRANCH")
    private String branch;

    @JsonProperty("ADDRESS")
    private String address;

    @JsonProperty("CITY")
    private String city;

    @JsonProperty("CENTRE")
    private String centre;

    @JsonProperty("DISTRICT")
    private String district;

    @JsonProperty("STATE")
    private String state;

    @JsonProperty("CONTACT")
    private String contact;

    @JsonProperty("MICR")
    private String micr;

    @JsonProperty("SWIFT")
    private String swift;

    @JsonProperty("ISO3166")
    private String iso3166;

    @JsonProperty("UPI")
    private Boolean upi;

    @JsonProperty("RTGS")
    private Boolean rtgs;

    @JsonProperty("NEFT")
    private Boolean neft;

    @JsonProperty("IMPS")
    private Boolean imps;
}