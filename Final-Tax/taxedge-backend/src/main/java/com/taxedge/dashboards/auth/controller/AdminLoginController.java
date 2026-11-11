package com.taxedge.dashboards.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.auth.dto.AdminLoginDto;
import com.taxedge.dashboards.auth.service.AdminLoginService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST controller for Admin Login authentication and profile endpoints.
 */

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminLoginController {

    private final AdminLoginService adminLoginService;

    @GetMapping("/profile")
    public ResponseEntity<AdminLoginDto> getAdminByEmail(@RequestParam String email) {
        log.info("Received request for admin profile by email: {}", email);
        AdminLoginDto admin = adminLoginService.getAdminByEmail(email);
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminLoginDto> updateAdmin(
            @PathVariable Long id,
            @RequestBody AdminLoginDto adminLoginDto) {
        log.info("Received request to update admin with id: {}", id);
        AdminLoginDto updated = adminLoginService.updateAdmin(id, adminLoginDto);
        return ResponseEntity.ok(updated);
    }
}