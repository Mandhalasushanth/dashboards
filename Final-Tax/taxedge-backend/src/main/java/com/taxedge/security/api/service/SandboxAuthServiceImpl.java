package com.taxedge.security.api.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.config.SandboxProperties;
import com.taxedge.security.api.entity.ApiAccessToken;
import com.taxedge.security.api.helper.SandboxAuthHelper;
import com.taxedge.security.api.repository.ApiAccessTokenRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SandboxAuthServiceImpl implements SandboxAuthService {

    private static final int TOKEN_VALIDITY_HOURS = 23;
    private final ApiAccessTokenRepository repository;
    private final ObjectMapper objectMapper;
    private final SandboxProperties sandboxProperties;

    @PostConstruct
    void validateConfiguration() {
        SandboxAuthHelper.validateConfiguration(
                sandboxProperties.getBaseUrl(),
                sandboxProperties.getApiKey(),
                sandboxProperties.getApiSecret());
        log.info("Sandbox integration configured for {} with key {}",
                sandboxProperties.getBaseUrl(),
                SandboxAuthHelper.mask(sandboxProperties.getApiKey()));
    }

    @Override
    public synchronized String getAccessToken() {

        ApiAccessToken stored = repository.findFirstByOrderByIdAsc().orElse(null);

        if (stored != null
                && stored.getExpiresAt() != null
                && LocalDateTime.now().isBefore(stored.getExpiresAt())) {
            return stored.getAccessToken();
        }

        return generateNewToken();
    }

    @Override
    public synchronized String generateNewToken() {

        String freshToken = SandboxAuthHelper.authenticate(
                sandboxProperties.getBaseUrl(),
                sandboxProperties.getApiKey(),
                sandboxProperties.getApiSecret(),
                sandboxProperties.getApiVersion(),
                objectMapper);
        LocalDateTime now = LocalDateTime.now();

        ApiAccessToken entity = repository.findFirstByOrderByIdAsc()
                .orElseGet(ApiAccessToken::new);

        entity.setAccessToken(freshToken);
        entity.setIssuedAt(now);
        entity.setExpiresAt(now.plusHours(TOKEN_VALIDITY_HOURS));

        repository.save(entity);

        log.info("Sandbox access token generated, valid until {}", entity.getExpiresAt());
        return freshToken;
    }
}
