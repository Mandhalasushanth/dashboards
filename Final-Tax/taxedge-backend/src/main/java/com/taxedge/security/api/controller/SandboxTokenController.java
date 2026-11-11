package com.taxedge.security.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.security.api.service.SandboxAuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/sandbox")
@RequiredArgsConstructor
public class SandboxTokenController {

	
	private final SandboxAuthService sandboxAuthService;

    @PostMapping("/refresh-token")
    public ResponseEntity<String> refreshToken() {
        sandboxAuthService.generateNewToken();
        return ResponseEntity.ok("Sandbox access token refreshed");
    }
    
}