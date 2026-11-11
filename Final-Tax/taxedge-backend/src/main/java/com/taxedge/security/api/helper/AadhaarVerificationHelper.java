package com.taxedge.security.api.helper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.dto.AadhaarOtpRequest;
import com.taxedge.security.api.dto.AadhaarOtpResponse;
import com.taxedge.security.api.dto.AadhaarVerifyOtpPayload;
import com.taxedge.security.api.dto.AadhaarVerifyOtpResponse;
import com.taxedge.security.api.exception.ExternalServiceException;

public final class AadhaarVerificationHelper {

    private static final String OTP_PATH = "/kyc/aadhaar/okyc/otp";
    private static final String OTP_VERIFY_PATH = "/kyc/aadhaar/okyc/otp/verify";
    private static final String OTP_ENTITY = "in.co.sandbox.kyc.aadhaar.okyc.otp.request";
    private static final String OTP_VERIFY_ENTITY = "in.co.sandbox.kyc.aadhaar.okyc.request";
    private static final String REASON = "KYC verification";
    private static final String CONSENT = "Y";

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private AadhaarVerificationHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    public static String normaliseAndValidate(String aadhaar) {
        if (aadhaar == null || aadhaar.isBlank()) {
            throw new IllegalArgumentException("Aadhaar number is required");
        }
        return aadhaar.replaceAll("\\s+", "");
    }

    /** Masks all but the last four digits for logging. */
    public static String maskAadhaar(String aadhaar) {
        if (aadhaar == null || aadhaar.length() < 4) {
            return "************";
        }
        int len = aadhaar.length();
        return "*".repeat(Math.max(0, len - 4)) + aadhaar.substring(len - 4);
    }

    public static String buildOtpPayload(ObjectMapper objectMapper, String aadhaar) {
        try {
            AadhaarOtpRequest request = AadhaarOtpRequest.builder()
                    .entity(OTP_ENTITY)
                    .aadhaarNumber(aadhaar)
                    .consent(CONSENT)
                    .reason(REASON)
                    .build();

            return objectMapper.writeValueAsString(request);

        } catch (IOException ex) {
            throw new ExternalServiceException("Could not build Aadhaar OTP request", ex);
        }
    }

    public static HttpRequest buildOtpRequest(String baseUrl, String apiKey, String token,
                                              String payload, String apiVersion) {

        requireText(baseUrl, "sandbox.base-url");
        requireText(apiKey, "sandbox.api-key");
        requireText(token, "access token");
        requireText(payload, "request payload");

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(SandboxAuthHelper.resolveUrl(baseUrl, OTP_PATH)))
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

    public static AadhaarOtpResponse parseOtpResponse(ObjectMapper objectMapper,
                                                      String responseBody) {

        if (responseBody == null || responseBody.isBlank()) {
            throw new ExternalServiceException("Aadhaar OTP returned an empty response");
        }

        try {
            AadhaarOtpResponse response =
                    objectMapper.readValue(responseBody, AadhaarOtpResponse.class);

            if (response.getData() == null) {
                throw new ExternalServiceException("Aadhaar OTP returned no data block");
            }
            return response;

        } catch (IOException ex) {
            throw new ExternalServiceException("Unreadable response from Aadhaar OTP", ex);
        }
    }

    public static String buildVerifyOtpPayload(ObjectMapper objectMapper, String referenceId, String otp) {
        try {
            AadhaarVerifyOtpPayload payload = AadhaarVerifyOtpPayload.builder()
                    .entity(OTP_VERIFY_ENTITY)
                    .referenceId(referenceId)
                    .otp(otp)
                    .build();

            return objectMapper.writeValueAsString(payload);
        } catch (IOException ex) {
            throw new ExternalServiceException("Could not build Aadhaar OTP verification request", ex);
        }
    }

    public static HttpRequest buildVerifyOtpRequest(String baseUrl, String apiKey, String token,
                                                    String payload, String apiVersion) {

        requireText(baseUrl, "sandbox.base-url");
        requireText(apiKey, "sandbox.api-key");
        requireText(token, "access token");
        requireText(payload, "request payload");

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(SandboxAuthHelper.resolveUrl(baseUrl, OTP_VERIFY_PATH)))
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

    public static AadhaarVerifyOtpResponse parseVerifyOtpResponse(ObjectMapper objectMapper,
                                                                  String responseBody) {

        if (responseBody == null || responseBody.isBlank()) {
            throw new ExternalServiceException("Aadhaar OTP verify returned an empty response");
        }

        try {
            return objectMapper.readValue(responseBody, AadhaarVerifyOtpResponse.class);
        } catch (IOException ex) {
            throw new ExternalServiceException("Unreadable response from Aadhaar OTP verify: " + responseBody, ex);
        }
    }

    private static void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing required value: " + field);
        }
    }
}
