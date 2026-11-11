package com.taxedge.dashboards.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.auth.dto.LoginRequestDto;
import com.taxedge.dashboards.auth.dto.LoginResponseDto;
import com.taxedge.dashboards.auth.service.LoginService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * The one sign-in endpoint behind the login page, for admins, managers and agents.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        log.info("Received login request for: {}",
                loginRequestDto.getEmail() != null ? loginRequestDto.getEmail() : loginRequestDto.getUsername());
        return ResponseEntity.ok(loginService.login(loginRequestDto));
    }
}
