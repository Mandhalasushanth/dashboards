package com.taxedge.security.api.helper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.dto.GstSearchResponse;
import com.taxedge.security.api.dto.VerifyGstinRequest;
import com.taxedge.security.api.exception.ExternalServiceException;

public final class GstSearchHelper {

    private static final String SEARCH_PATH = "/gst/compliance/public/gstin/search";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private GstSearchHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    public static String normalise(String gstin) {
        if (gstin == null || gstin.isBlank()) {
            throw new IllegalArgumentException("GSTIN is required");
        }
        return gstin.replaceAll("\\s+", "").toUpperCase();
    }

    public static String buildPayload(ObjectMapper objectMapper, String gstin) {
        try {
            VerifyGstinRequest payload = VerifyGstinRequest.builder()
                    .gstin(normalise(gstin))
                    .build();
            return objectMapper.writeValueAsString(payload);
        } catch (IOException ex) {
            throw new ExternalServiceException("Could not build GST search request", ex);
        }
    }

    public static HttpRequest buildRequest(String baseUrl, String apiKey, String token,
                                           String payload, String apiVersion) {

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(SandboxAuthHelper.resolveUrl(baseUrl, SEARCH_PATH)))
                .header("Authorization", token)
                .header("x-api-key", apiKey)
                .header("Content-Type", "application/json")
                .header("accept", "application/json")
                .timeout(REQUEST_TIMEOUT)
                .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8));

        if (apiVersion != null && !apiVersion.isBlank()) {
            builder.header("x-api-version", apiVersion);
        }

        return builder.build();
    }

    public static GstSearchResponse parseResponse(ObjectMapper objectMapper, String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            throw new ExternalServiceException("GST search returned an empty response");
        }

        try {
            return objectMapper.readValue(responseBody, GstSearchResponse.class);
        } catch (IOException ex) {
            throw new ExternalServiceException("Unreadable response from GST search: " + responseBody, ex);
        }
    }
}