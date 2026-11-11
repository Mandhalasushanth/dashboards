package com.taxedge.security.api.helper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.dto.AuthenticateResponse;
import com.taxedge.security.api.exception.ApiAuthenticationException;
import com.taxedge.security.api.exception.ExternalServiceException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class SandboxAuthHelper {

    private static final int MAX_ATTEMPTS = 3;
    private static final long RETRY_BACKOFF_MS = 1_000L;
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(15);
    private static final int MASK_VISIBLE_CHARS = 4;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    private SandboxAuthHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    public static void validateConfiguration(String baseUrl, String apiKey, String apiSecret) {
        if (isBlank(baseUrl) || isBlank(apiKey) || isBlank(apiSecret)) {
            throw new IllegalStateException(
                    "Sandbox integration is misconfigured: base-url, api-key and api-secret are required");
        }
    }

    public static String authenticate(String baseUrl, String apiKey, String apiSecret,
                                     String apiVersion, ObjectMapper objectMapper) {
        return authenticateWithRetry(baseUrl, apiKey, apiSecret, apiVersion, objectMapper, 1);
    }

    public static String authenticate(String baseUrl, String apiKey, String apiSecret,
                                     ObjectMapper objectMapper) {
        return authenticate(baseUrl, apiKey, apiSecret, "1.0", objectMapper);
    }

    private static String authenticateWithRetry(String baseUrl, String apiKey, String apiSecret,
                                               String apiVersion, ObjectMapper objectMapper, int attempt) {
        HttpRequest request = buildAuthenticateRequest(baseUrl, apiKey, apiSecret, apiVersion);

        try {
            HttpResponse<String> response =
                    HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();

            if (status == 200) {
                return extractToken(objectMapper, response.body());
            }

            if (isCredentialFailure(status)) {
                log.error("Sandbox rejected credentials (status {}, key {}, body: {})",
                        status, mask(apiKey), response.body());
                throw new ApiAuthenticationException("Sandbox authentication rejected: " + response.body());
            }

            if (!isRetryable(status)) {
                throw new ExternalServiceException("Sandbox authentication failed with status " + status);
            }

            log.warn("Sandbox authenticate attempt {}/{} failed with status {}",
                    attempt, MAX_ATTEMPTS, status);

            return retryOrFail(baseUrl, apiKey, apiSecret, apiVersion, objectMapper, attempt,
                    "Sandbox authentication failed with status " + status, null);

        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException("Sandbox authentication interrupted", ex);

        } catch (IOException ex) {
            log.warn("Sandbox authenticate attempt {}/{} failed: {}",
                    attempt, MAX_ATTEMPTS, ex.getMessage());
            return retryOrFail(baseUrl, apiKey, apiSecret, apiVersion, objectMapper, attempt,
                    "Sandbox service unreachable", ex);
        }
    }

    private static String retryOrFail(String baseUrl, String apiKey, String apiSecret,
                                     String apiVersion, ObjectMapper objectMapper,
                                     int attempt, String message, Throwable cause) {
        if (attempt >= MAX_ATTEMPTS) {
            throw new ExternalServiceException(message, cause);
        }
        sleepBeforeRetry(RETRY_BACKOFF_MS, attempt);
        return authenticateWithRetry(baseUrl, apiKey, apiSecret, apiVersion, objectMapper, attempt + 1);
    }

    public static HttpRequest buildAuthenticateRequest(String baseUrl, String apiKey,
                                                       String apiSecret) {
        return buildAuthenticateRequest(baseUrl, apiKey, apiSecret, "1.0");
    }

    public static HttpRequest buildAuthenticateRequest(String baseUrl, String apiKey,
                                                       String apiSecret, String apiVersion) {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(resolveUrl(baseUrl, "/authenticate")))
                .header("x-api-key", apiKey)
                .header("x-api-secret", apiSecret)
                .header("accept", "application/json")
                .timeout(REQUEST_TIMEOUT)
                .POST(HttpRequest.BodyPublishers.noBody());

        if (apiVersion != null && !apiVersion.isBlank()) {
            builder.header("x-api-version", apiVersion);
        }

        return builder.build();
    }

    public static String extractToken(ObjectMapper objectMapper, String responseBody) {
        try {
            AuthenticateResponse body =
                    objectMapper.readValue(responseBody, AuthenticateResponse.class);

            if (body.getData() != null && !isBlank(body.getData().getAccessToken())) {
                return body.getData().getAccessToken();
            }
            if (!isBlank(body.getAccessToken())) {
                return body.getAccessToken();
            }
            throw new ExternalServiceException("Sandbox authenticate returned no access token");

        } catch (IOException ex) {
            throw new ExternalServiceException("Unreadable response from Sandbox authenticate", ex);
        }
    }

    public static String resolveUrl(String baseUrl, String path) {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String cleanPath = path.startsWith("/") ? path : "/" + path;
        if (base.endsWith(cleanPath)) {
            return base;
        }
        return base + cleanPath;
    }

    public static boolean isCredentialFailure(int status) {
        return status == 401 || status == 403;
    }

    public static boolean isRetryable(int status) {
        return status >= 500 || status == 429 || status == 408;
    }

    public static void sleepBeforeRetry(long baseBackoffMillis, int attempt) {
        try {
            Thread.sleep(baseBackoffMillis * attempt);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException("Sandbox authentication interrupted", ex);
        }
    }

    public static String mask(String secret) {
        if (isBlank(secret)) {
            return "****";
        }
        if (secret.length() <= MASK_VISIBLE_CHARS) {
            return "*".repeat(secret.length());
        }
        return "*".repeat(secret.length() - MASK_VISIBLE_CHARS)
                + secret.substring(secret.length() - MASK_VISIBLE_CHARS);
    }

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}