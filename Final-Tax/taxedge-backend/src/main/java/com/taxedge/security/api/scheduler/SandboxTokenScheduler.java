package com.taxedge.security.api.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.security.api.entity.ApiAccessToken;
import com.taxedge.security.api.repository.ApiAccessTokenRepository;
import com.taxedge.security.api.service.SandboxAuthService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class SandboxTokenScheduler {

    private final SandboxAuthService sandboxAuthService;
    private final ApiAccessTokenRepository apiAccessTokenRepository;

    @Scheduled(cron = "0 * * * * *", zone = "Asia/Kolkata")
    public void scheduleTokenRefresh() {
        checkAndRegenerateToken();
    }

    private void checkAndRegenerateToken() {
        try {
            ApiAccessToken token = apiAccessTokenRepository.findFirstByOrderByIdAsc().orElse(null);

            if (token == null || token.getExpiresAt() == null) {
                log.info("No Sandbox access token found or expiresAt is null. Generating fresh token...");
                sandboxAuthService.generateNewToken();
                return;
            }

            LocalDateTime now = LocalDateTime.now();

            if (!now.isBefore(token.getExpiresAt())) {
                log.info("Sandbox access token reached expiration time ({}). Regenerating new token...",
                        token.getExpiresAt());
                sandboxAuthService.generateNewToken();
            }
        } catch (Exception e) {
            log.error("Failed to check or regenerate Sandbox access token: {}", e.getMessage(), e);
        }
    }
}
