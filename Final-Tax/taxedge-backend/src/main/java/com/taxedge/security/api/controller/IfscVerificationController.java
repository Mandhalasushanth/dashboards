package com.taxedge.security.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.security.api.dto.IfscVerificationResponse;
import com.taxedge.security.api.dto.VerifyIfscRequest;
import com.taxedge.security.api.service.IfscVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/kyc/bank")
@RequiredArgsConstructor
public class IfscVerificationController {

    private final IfscVerificationService ifscVerificationService;

    @PostMapping("/ifsc")
    public ResponseEntity<IfscVerificationResponse> verifyIfsc(@Valid @RequestBody VerifyIfscRequest request) {
        log.info("Received request to verify IFSC");
        IfscVerificationResponse response = ifscVerificationService.verifyIfsc(request.getIfsc());
        return ResponseEntity.ok(response);
    }
}