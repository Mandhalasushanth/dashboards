package com.taxedge.security.api.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class GstSearchResponse {

    private int code;
    private long timestamp;

    @JsonProperty("transaction_id")
    private String transactionId;

    private DataContainer data;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataContainer {

        @JsonProperty("status_cd")
        private String statusCd;

        private GstBusinessDetails data;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GstBusinessDetails {

        private String gstin;

        @JsonProperty("lgnm")
        private String legalName; // e.g. "Vicky Pvt Ltd"

        @JsonProperty("tradeNam")
        private String tradeName; // e.g. "Vicky Pvt Ltd"

        @JsonProperty("ctb")
        private String constitutionOfBusiness; // e.g. "Proprietorship"

        @JsonProperty("sts")
        private String status; // e.g. "Active"

        @JsonProperty("dty")
        private String taxpayerType; // e.g. "Regular"

        @JsonProperty("rgdt")
        private String registrationDate; // e.g. "18/10/2019"

        @JsonProperty("lstupdt")
        private String lastUpdatedDate;

        @JsonProperty("cxdt")
        private String cancellationDate;

        @JsonProperty("einvoiceStatus")
        private String einvoiceStatus;

        @JsonProperty("ctj")
        private String centerJurisdiction;

        @JsonProperty("ctjCd")
        private String centerJurisdictionCode;

        @JsonProperty("stj")
        private String stateJurisdiction;

        @JsonProperty("stjCd")
        private String stateJurisdictionCode;

        @JsonProperty("nba")
        private List<String> natureOfBusinessActivities;

        @JsonProperty("adadr")
        private List<Object> additionalAddress;

        @JsonProperty("pradr")
        private PrincipalAddress pradr;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PrincipalAddress {

        private AddressDetails addr;

        @JsonProperty("ntr")
        @JsonFormat(with = JsonFormat.Feature.ACCEPT_SINGLE_VALUE_AS_ARRAY)
        private List<String> natureOfBusiness;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressDetails {

        @JsonProperty("bnm")
        private String buildingName;

        @JsonProperty("bno")
        private String buildingNumber;

        @JsonProperty("flno")
        private String floorNumber;

        @JsonProperty("st")
        private String street;

        @JsonProperty("loc")
        private String location;

        @JsonProperty("locality")
        private String locality;

        @JsonProperty("landMark")
        private String landmark;

        @JsonProperty("dst")
        private String district;

        @JsonProperty("stcd")
        private String state;

        @JsonProperty("pncd")
        private String pincode;

        @JsonProperty("geocodelvl")
        private String geocodeLevel;

        @JsonProperty("lt")
        private String latitude;

        @JsonProperty("lg")
        private String longitude;
    }
}