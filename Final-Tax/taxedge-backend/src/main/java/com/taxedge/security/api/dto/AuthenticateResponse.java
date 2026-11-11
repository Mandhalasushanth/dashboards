package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AuthenticateResponse {

    private int code;

    @JsonProperty("access_token")
    private String accessToken;

    private Data data;

    private long timestamp;

    @JsonProperty("transaction_id")
    private String transactionId;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Data {

        @JsonProperty("access_token")
        private String accessToken;
    }
}