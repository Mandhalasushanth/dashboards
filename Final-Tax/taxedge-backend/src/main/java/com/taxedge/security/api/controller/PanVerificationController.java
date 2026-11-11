package com.taxedge.security.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.security.api.dto.VerifyPanRequest;
import com.taxedge.security.api.service.PanVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/kyc/pan")
@RequiredArgsConstructor
public class PanVerificationController {

    private final PanVerificationService panVerificationService;

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyPan(@Valid @RequestBody VerifyPanRequest request) {
        return ResponseEntity.ok(panVerificationService.verifyPan(request.getPan()));
    }
}