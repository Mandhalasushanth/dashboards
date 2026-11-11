package com.taxedge.dashboards.auth.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.auth.dto.LoginRequestDto;
import com.taxedge.dashboards.auth.dto.LoginResponseDto;
import com.taxedge.dashboards.auth.helper.LoginHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * One login page for everyone; the email ending says which accounts to check:
 * "...admin@gmail.com" against admins, "...manager@gmail.com" against managers and
 * "...agent@gmail.com" against agents. The returned role (ADMIN, CA_MANAGER, LOAN_AGENT, ...)
 * tells the frontend which dashboard to open.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private static final String INVALID_LOGIN = "Invalid username or password";

    private final LoginHelper loginHelper;

    @Override
    @Transactional
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        String email = loginHelper.identifierOf(loginRequestDto);
        String password = Optional.ofNullable(loginRequestDto.getPassword())
                .filter(value -> !value.isBlank())
                .orElseThrow(() -> new IllegalArgumentException("Password is required"));
        log.info("Login attempt for: {}", email);

        // The same message for an unknown email and a wrong password, so sign-in never reveals which emails exist.
        return loginHelper.loginByEmailEnding(email, password)
                .orElseThrow(() -> new IllegalArgumentException(INVALID_LOGIN));
    }
}
