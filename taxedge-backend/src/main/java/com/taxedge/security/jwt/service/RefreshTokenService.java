package com.taxedge.security.jwt.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.taxedge.customer.entity.Customer;
import com.taxedge.security.jwt.entity.RefreshToken;
import com.taxedge.security.jwt.repository.RefreshTokenRepository;

import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    
    public static final int REFRESH_TOKEN_EXPIRY_DAYS = 30;

    
    @Transactional
    public String createRefreshToken(Customer customer) {
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);

        Optional<RefreshToken> latestActiveOpt =
                refreshTokenRepository.findFirstByCustomerAndRevokedFalseOrderByCreatedAtDesc(customer);

        RefreshToken tokenEntity;

        if (latestActiveOpt.isPresent()) {
            // Reuse the latest active row — update its hash and reset the window
            tokenEntity = latestActiveOpt.get();
            tokenEntity.setTokenHash(tokenHash);
            tokenEntity.setCreatedAt(LocalDateTime.now());
            tokenEntity.setExpiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRY_DAYS));
            tokenEntity.setRevoked(false);

        
            List<RefreshToken> duplicates =
                    refreshTokenRepository.findAllByCustomerAndRevokedFalseAndIdNot(
                            customer, tokenEntity.getId());
            if (!duplicates.isEmpty()) {
                log.warn("[RefreshToken] Found {} duplicate active token(s) for customer [{}] — revoking extras",
                        duplicates.size(), customer.getCustId());
                for (RefreshToken dup : duplicates) {
                    dup.setRevoked(true);
                    refreshTokenRepository.save(dup);
                }
            }
        } else {
            // First-time issuance
            tokenEntity = RefreshToken.builder()
                    .tokenHash(tokenHash)
                    .customer(customer)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRY_DAYS))
                    .revoked(false)
                    .build();
        }

        refreshTokenRepository.save(tokenEntity);
        log.debug("[RefreshToken] Issued new refresh token for customer [{}]", customer.getCustId());
        return rawToken;
    }

   
    @Transactional
    public String rotateRefreshToken(RefreshToken storedToken) {
        String newRawToken = generateRawToken();
        String newTokenHash = hashToken(newRawToken);

        // Overwrite the existing row atomically — the old hash is gone
        storedToken.setTokenHash(newTokenHash);
        storedToken.setCreatedAt(LocalDateTime.now());
        storedToken.setExpiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_EXPIRY_DAYS));
        storedToken.setRevoked(false);

        refreshTokenRepository.save(storedToken);
        log.debug("[RefreshToken] Rotated refresh token (entity id={})", storedToken.getId());
        return newRawToken;
    }

    
    @Transactional(readOnly = true)
    public Optional<RefreshToken> validateRefreshToken(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);

        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHash(tokenHash);

        if (tokenOpt.isEmpty()) {
            log.warn("[RefreshToken] Validation failed — hash not found (possible replay or invalid token)");
            return Optional.empty();
        }

        RefreshToken storedToken = tokenOpt.get();

        if (storedToken.isRevoked()) {
            log.warn("[RefreshToken] Validation failed — token is revoked (entity id={})", storedToken.getId());
            return Optional.empty();
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.info("[RefreshToken] Validation failed — token expired at {} (entity id={})",
                    storedToken.getExpiresAt(), storedToken.getId());
            return Optional.empty();
        }

        return Optional.of(storedToken);
    }

   
    @Transactional
    public void revokeRefreshToken(String rawRefreshToken) {
        String tokenHash = hashToken(rawRefreshToken);

        refreshTokenRepository.findByTokenHash(tokenHash).ifPresentOrElse(
                storedToken -> {
                    storedToken.setRevoked(true);
                    refreshTokenRepository.save(storedToken);
                    log.info("[RefreshToken] Revoked token (entity id={})", storedToken.getId());
                },
                () -> log.warn("[RefreshToken] revokeRefreshToken — hash not found, nothing to revoke")
        );
    }



    
    public String generateRawToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

   
    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available on this JVM", e);
        }
    }
}
