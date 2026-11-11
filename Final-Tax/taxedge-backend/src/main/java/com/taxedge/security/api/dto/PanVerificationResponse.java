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
public class PanVerificationResponse {

    private int code;

    private String message;

    private long timestamp;

    @JsonProperty("transaction_id")
    private String transactionId;

    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {

        private String pan;

        private String category;

        private String status;

        private String remarks;

        @JsonProperty("name_as_per_pan_match")
        private Boolean nameMatch;

        @JsonProperty("date_of_birth_match")
        private Boolean dobMatch;

        @JsonProperty("aadhaar_seeding_status")
        private String aadhaarSeedingStatus;
    }
}