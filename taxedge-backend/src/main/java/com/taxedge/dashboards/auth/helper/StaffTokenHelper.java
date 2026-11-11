package com.taxedge.dashboards.auth.helper;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;

import com.taxedge.dashboards.auth.entity.AdminLogin;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.security.jwt.service.JwtService;
import com.taxedge.security.jwt.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;

/**
 * Issues tokens for admin, manager and agent accounts. Only the refresh token's hash is kept on the
 * account, so issuing a new one replaces the last. Call inside a transaction so the hash is saved.
 */
@Component
@RequiredArgsConstructor
public class StaffTokenHelper {

    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public record StaffTokens(String accessToken, String refreshToken) {
    }

    public StaffTokens issueTokens(AdminLogin admin) {
        String refreshToken = refreshTokenService.generateRawToken();
        admin.setRefreshTokenHash(refreshTokenService.hashToken(refreshToken));
        admin.setRefreshTokenExpiresAt(refreshTokenExpiry());
        return new StaffTokens(accessToken("ADMIN", admin.getId(), admin.getFullName(), admin.getEmail(), "ADMIN"), refreshToken);
    }

    public StaffTokens issueTokens(ManagerLogin manager) {
        String refreshToken = refreshTokenService.generateRawToken();
        manager.setRefreshTokenHash(refreshTokenService.hashToken(refreshToken));
        manager.setRefreshTokenExpiresAt(refreshTokenExpiry());
        return new StaffTokens(accessToken("MANAGER", manager.getId(), manager.getFullName(), manager.getEmail(), manager.getRole().name()), refreshToken);
    }

    public StaffTokens issueTokens(AgentLogin agent) {
        String refreshToken = refreshTokenService.generateRawToken();
        agent.setRefreshTokenHash(refreshTokenService.hashToken(refreshToken));
        agent.setRefreshTokenExpiresAt(refreshTokenExpiry());
        return new StaffTokens(accessToken("AGENT", agent.getId(), agent.getFullName(), agent.getEmail(), agent.getRole().name()), refreshToken);
    }

    /** Ids overlap across the account tables, so the subject also names the account type. */
    private String accessToken(String accountType, Long id, String name, String email, String role) {
        return jwtService.generateStaffToken(accountType + ":" + id, name, email, "ROLE_" + role);
    }

    private LocalDateTime refreshTokenExpiry() {
        return LocalDateTime.now().plusDays(RefreshTokenService.REFRESH_TOKEN_EXPIRY_DAYS);
    }
}
