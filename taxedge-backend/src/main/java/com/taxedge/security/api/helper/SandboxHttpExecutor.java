package com.taxedge.security.api.helper;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import com.taxedge.security.api.exception.ApiAuthenticationException;
import com.taxedge.security.api.exception.ExternalServiceException;
import com.taxedge.security.api.service.SandboxAuthService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SandboxHttpExecutor {

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    private final SandboxAuthService sandboxAuthService;

    public String execute(Function<String, HttpRequest> requestFactory, String operation) {
        return execute(requestFactory, sandboxAuthService.getAccessToken(), operation, true);
    }

    private String execute(Function<String, HttpRequest> requestFactory, String token,
                           String operation, boolean allowRefresh) {

        try {
            HttpRequest request = requestFactory.apply(token);
            log.info("Sending {} to {}", operation, request.uri());

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            int status = response.statusCode();

            if (status == 200) {
                return response.body();
            }

            if (status == 401 || status == 403) {
                return handleTokenRejection(requestFactory, operation, allowRefresh, status);
            }

            if (status >= 400 && status < 500) {
                log.warn("{} rejected with status {}: {}", operation, status, response.body());
                String errorMsg = response.body() != null && !response.body().isBlank()
                        ? response.body()
                        : (operation + " rejected with status " + status);
                throw new IllegalArgumentException(errorMsg);
            }

            log.error("{} failed with status {}: {}", operation, status, response.body());
            throw new ExternalServiceException(operation + " failed with status " + status + ": " + response.body());

        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ExternalServiceException(operation + " interrupted", ex);

        } catch (IOException ex) {
            log.warn("Sandbox unreachable during {}: {}", operation, ex.getMessage());
            throw new ExternalServiceException("Sandbox service unreachable", ex);
        }
    }

    private String handleTokenRejection(Function<String, HttpRequest> requestFactory,
                                        String operation, boolean allowRefresh, int status) {

        if (!allowRefresh) {
            log.error("Sandbox rejected a freshly generated token (status {}). Check api-key and api-secret.", status);
            throw new ApiAuthenticationException("Sandbox authentication rejected");
        }

        log.warn("Sandbox rejected the stored token during {} (status {}). Refreshing and retrying once.",
                operation, status);
        return execute(requestFactory, sandboxAuthService.generateNewToken(), operation, false);
    }
}
