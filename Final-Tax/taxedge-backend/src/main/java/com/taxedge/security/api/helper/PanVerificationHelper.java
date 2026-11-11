package com.taxedge.security.api.helper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.dto.PanVerificationRequest;
import com.taxedge.security.api.dto.PanVerificationResponse;
import com.taxedge.security.api.exception.ExternalServiceException;

public final class PanVerificationHelper {

    private static final String PATH    = "/kyc/pan/verify";
    private static final String ENTITY  = "in.co.sandbox.kyc.pan_verification.request";
    private static final String REASON  = "For onboarding customers";
    private static final String CONSENT = "Y";
    private static final String VALID   = "valid";

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private PanVerificationHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    private static final Pattern PAN_PATTERN = Pattern.compile("^[A-Z]{5}[0-9]{4}[A-Z]{1}$");

    public static String normaliseAndValidate(String pan) {
        if (pan == null || pan.isBlank()) {
            throw new IllegalArgumentException("PAN is required");
        }
        String normalised = pan.replaceAll("\\s+", "").toUpperCase();
        if (!PAN_PATTERN.matcher(normalised).matches()) {
            throw new IllegalArgumentException("Invalid PAN format: " + pan);
        }
        return normalised;
    }

    public static String maskPan(String pan) {
        if (pan == null || pan.length() < 10) {
            return "****";
        }
        return pan.substring(0, 5) + "****" + pan.substring(9);
    }

    public static String buildPayload(ObjectMapper objectMapper, String pan) {
        String name = null;
        String dob = null;
        // Sandbox mock testing PAN requires exact name and DOB match
        if ("XXXPX1234A".equalsIgnoreCase(pan)) {
            name = "John Ronald Doe";
            dob = "11/11/2001";
        }
        return buildPayload(objectMapper, pan, name, dob);
    }

    public static String buildPayload(ObjectMapper objectMapper, String pan, String name, String dob) {
        try {
            PanVerificationRequest.PanVerificationRequestBuilder builder = PanVerificationRequest.builder()
                    .entity(ENTITY)
                    .pan(pan)
                    .consent(CONSENT)
                    .reason(REASON);

            if (name != null && !name.isBlank()) {
                builder.nameAsPerPan(name);
            }
            if (dob != null && !dob.isBlank()) {
                builder.dateOfBirth(dob);
            }

            return objectMapper.writeValueAsString(builder.build());

        } catch (IOException ex) {
            throw new ExternalServiceException("Could not build PAN verification request", ex);
        }
    }

    public static String buildPayload(ObjectMapper objectMapper, PanVerificationRequest request) {
        try {
            if (request.getEntity() == null || request.getEntity().isBlank()) {
                request.setEntity(ENTITY);
            }
            if (request.getConsent() == null || request.getConsent().isBlank()) {
                request.setConsent(CONSENT);
            }
            if (request.getReason() == null || request.getReason().isBlank()) {
                request.setReason(REASON);
            }
            if (request.getNameAsPerPan() == null && "XXXPX1234A".equalsIgnoreCase(request.getPan())) {
                request.setNameAsPerPan("John Ronald Doe");
            }
            if (request.getDateOfBirth() == null && "XXXPX1234A".equalsIgnoreCase(request.getPan())) {
                request.setDateOfBirth("11/11/2001");
            }
            return objectMapper.writeValueAsString(request);
        } catch (IOException ex) {
            throw new ExternalServiceException("Could not build PAN verification request", ex);
        }
    }

    public static HttpRequest buildVerifyRequest(String baseUrl, String apiKey,
                                                 String token, String payload) {
        return buildVerifyRequest(baseUrl, apiKey, token, payload, "1.0");
    }

    public static HttpRequest buildVerifyRequest(String baseUrl, String apiKey,
                                                 String token, String payload, String apiVersion) {

        requireText(baseUrl, "sandbox.base-url");
        requireText(apiKey, "sandbox.api-key");
        requireText(token, "access token");
        requireText(payload, "request payload");

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(SandboxAuthHelper.resolveUrl(baseUrl, PATH)))
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

    public static PanVerificationResponse parseResponse(ObjectMapper objectMapper,
                                                        String responseBody) {

        if (responseBody == null || responseBody.isBlank()) {
            throw new ExternalServiceException("PAN verification returned an empty response");
        }

        try {
            return objectMapper.readValue(responseBody, PanVerificationResponse.class);
        } catch (IOException ex) {
            throw new ExternalServiceException("Unreadable response from PAN verification: " + responseBody, ex);
        }
    }

    public static boolean isValidStatus(String status) {
        return VALID.equalsIgnoreCase(status);
    }

    private static void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing required value: " + field);
        }
    }
}
