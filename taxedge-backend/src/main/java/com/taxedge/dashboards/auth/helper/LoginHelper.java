package com.taxedge.dashboards.auth.helper;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.taxedge.dashboards.auth.dto.LoginRequestDto;
import com.taxedge.dashboards.auth.dto.LoginResponseDto;
import com.taxedge.dashboards.auth.entity.AdminLogin;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.auth.repository.AdminLoginRepository;
import com.taxedge.dashboards.auth.repository.AgentLoginRepository;
import com.taxedge.dashboards.auth.repository.ManagerLoginRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Account lookups and password checks for the shared sign-in, used by LoginServiceImpl.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LoginHelper {

    private static final String ADMIN_EMAIL_ENDING = "admin@gmail.com";
    private static final String MANAGER_EMAIL_ENDING = "manager@gmail.com";
    private static final String AGENT_EMAIL_ENDING = "agent@gmail.com";

    private final AdminLoginRepository adminLoginRepository;
    private final ManagerLoginRepository managerLoginRepository;
    private final AgentLoginRepository agentLoginRepository;
    private final PasswordEncoder passwordEncoder;
    private final StaffTokenHelper staffTokenHelper;

    /** An email with none of the three endings matches no account. */
    public Optional<LoginResponseDto> loginByEmailEnding(String email, String password) {
        if (email.endsWith(ADMIN_EMAIL_ENDING)) {
            return adminLogin(email, password);
        }
        if (email.endsWith(MANAGER_EMAIL_ENDING)) {
            return managerLogin(email, password);
        }
        if (email.endsWith(AGENT_EMAIL_ENDING)) {
            return agentLogin(email, password);
        }
        log.warn("Login refused, email has no admin, manager or agent ending: {}", email);
        return Optional.empty();
    }

    public String identifierOf(LoginRequestDto loginRequestDto) {
        return Optional.ofNullable(loginRequestDto.getEmail())
                .filter(value -> !value.isBlank())
                .or(() -> Optional.ofNullable(loginRequestDto.getUsername()))
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .filter(value -> !value.isEmpty())
                .orElseThrow(() -> new IllegalArgumentException("Username or email is required"));
    }

    /** The seeded admin row may still hold a plain-text password, so both forms are accepted for admins. */
    private Optional<LoginResponseDto> adminLogin(String email, String password) {
        return adminLoginRepository.findByEmail(email)
                .filter(admin -> admin.getPassword() != null
                        && (passwordEncoder.matches(password, admin.getPassword()) || admin.getPassword().equals(password)))
                .map(this::toResponse);
    }

    private Optional<LoginResponseDto> managerLogin(String email, String password) {
        return managerLoginRepository.findByEmailIgnoreCase(email)
                .filter(manager -> passwordEncoder.matches(password, manager.getPassword()))
                .map(manager -> {
                    manager.setLastLoginAt(LocalDateTime.now());
                    return toResponse(managerLoginRepository.save(manager));
                });
    }

    private Optional<LoginResponseDto> agentLogin(String email, String password) {
        return agentLoginRepository.findByEmailIgnoreCase(email)
                .filter(agent -> passwordEncoder.matches(password, agent.getPassword()))
                .map(agent -> {
                    agent.setLastLoginAt(LocalDateTime.now());
                    return toResponse(agentLoginRepository.save(agent));
                });
    }

    private LoginResponseDto toResponse(AdminLogin admin) {
        StaffTokenHelper.StaffTokens tokens = staffTokenHelper.issueTokens(admin);
        return LoginResponseDto.builder()
                .accessToken(tokens.accessToken())
                .refreshToken(tokens.refreshToken())
                .id(admin.getId())
                .email(admin.getEmail())
                .username(admin.getEmail())
                .fullName(admin.getFullName())
                .role("ADMIN")
                .updatedAt(admin.getUpdatedAt())
                .build();
    }

    private LoginResponseDto toResponse(ManagerLogin manager) {
        StaffTokenHelper.StaffTokens tokens = staffTokenHelper.issueTokens(manager);
        return LoginResponseDto.builder()
                .accessToken(tokens.accessToken())
                .refreshToken(tokens.refreshToken())
                .id(manager.getId())
                .email(manager.getEmail())
                .username(manager.getEmail())
                .fullName(manager.getFullName())
                .role(manager.getRole().name())
                .lastLoginAt(manager.getLastLoginAt())
                .updatedAt(manager.getUpdatedAt())
                .build();
    }

    private LoginResponseDto toResponse(AgentLogin agent) {
        StaffTokenHelper.StaffTokens tokens = staffTokenHelper.issueTokens(agent);
        return LoginResponseDto.builder()
                .accessToken(tokens.accessToken())
                .refreshToken(tokens.refreshToken())
                .id(agent.getId())
                .email(agent.getEmail())
                .username(agent.getEmail())
                .fullName(agent.getFullName())
                .role(agent.getRole().name())
                .managerId(agent.getManager().getId())
                .lastLoginAt(agent.getLastLoginAt())
                .updatedAt(agent.getUpdatedAt())
                .build();
    }
}
