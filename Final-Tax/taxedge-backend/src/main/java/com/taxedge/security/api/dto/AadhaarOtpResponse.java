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
public class AadhaarOtpResponse {

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

        @JsonProperty("reference_id")
        private Long referenceId;

        private String message;
    }
}