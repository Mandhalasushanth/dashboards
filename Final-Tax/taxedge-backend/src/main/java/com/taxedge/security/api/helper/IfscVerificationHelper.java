package com.taxedge.security.api.helper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.dto.IfscVerificationResponse;
import com.taxedge.security.api.exception.ExternalServiceException;

public final class IfscVerificationHelper {

    private static final String BANK_PATH_PREFIX = "/bank/";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(15);

    private IfscVerificationHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    public static String normalise(String ifsc) {
        if (ifsc == null || ifsc.isBlank()) {
            throw new IllegalArgumentException("IFSC code is required");
        }
        return ifsc.replaceAll("\\s+", "").toUpperCase();
    }

    public static HttpRequest buildIfscRequest(String baseUrl, String apiKey, String token,
                                               String ifsc, String apiVersion) {

        String path = BANK_PATH_PREFIX + ifsc.trim().toUpperCase();

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(SandboxAuthHelper.resolveUrl(baseUrl, path)))
                .header("Authorization", token)
                .header("x-api-key", apiKey)
                .header("accept", "application/json")
                .timeout(REQUEST_TIMEOUT)
                .GET();

        if (apiVersion != null && !apiVersion.isBlank()) {
            builder.header("x-api-version", apiVersion);
        }

        return builder.build();
    }

    public static IfscVerificationResponse parseResponse(ObjectMapper objectMapper, String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            throw new ExternalServiceException("IFSC verification returned an empty response");
        }

        try {
            return objectMapper.readValue(responseBody, IfscVerificationResponse.class);
        } catch (IOException ex) {
            throw new ExternalServiceException("Unreadable response from IFSC verification: " + responseBody, ex);
        }
    }
}