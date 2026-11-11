package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AadhaarVerifyOtpResponse {

    private int code;

    private long timestamp;

    @JsonProperty("transaction_id")
    private String transactionId;

    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {

        @JsonProperty("@entity")
        private String entity;

        @JsonProperty("reference_id")
        private Object referenceId;

        private String status;

        private String message;

        @JsonProperty("care_of")
        private String careOf;

        @JsonProperty("full_name")
        private String fullName;

        private String gender;

        private String dob;

        @JsonProperty("year_of_birth")
        private String yearOfBirth;

        @JsonProperty("photo_link")
        private String photoLink;
    }
}

