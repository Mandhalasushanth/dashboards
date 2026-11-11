package com.taxedge.dashboards.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.auth.dto.ManagerLoginDto;
import com.taxedge.dashboards.auth.service.ManagerLoginService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for manager account creation: the administrator creates them under
 * /api/v1/admin/managers. Management operations are moved to CaManagerController.
 * Sign-in is LoginController (/api/v1/auth/login).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ManagerLoginController {

    private final ManagerLoginService managerLoginService;

    @PostMapping("/admin/managers")
    public ResponseEntity<ManagerLoginDto> createManager(@RequestBody ManagerLoginDto managerLoginDto) {
        log.info("Received request to create manager: {}", managerLoginDto.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(managerLoginService.createManager(managerLoginDto));
    }
}
