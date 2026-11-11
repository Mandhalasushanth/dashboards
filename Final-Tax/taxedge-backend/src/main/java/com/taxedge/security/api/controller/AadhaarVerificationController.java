package com.taxedge.security.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.security.api.dto.AadhaarOtpResponse;
import com.taxedge.security.api.dto.AadhaarVerifyOtpResponse;
import com.taxedge.security.api.dto.VerifyAadhaarOtpRequest;
import com.taxedge.security.api.dto.VerifyAadhaarRequest;
import com.taxedge.security.api.service.AadhaarVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/kyc/aadhaar")
@RequiredArgsConstructor
public class AadhaarVerificationController {

    private final AadhaarVerificationService aadhaarVerificationService;

    @PostMapping("/otp")
    public ResponseEntity<AadhaarOtpResponse> generateOtp(@Valid @RequestBody VerifyAadhaarRequest request) {
        log.info("Received request to generate Aadhaar OTP");
        AadhaarOtpResponse response = aadhaarVerificationService.generateOtp(request.getAadhaarNumber());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AadhaarVerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyAadhaarOtpRequest request) {
        log.info("Received request to verify Aadhaar OTP");
        AadhaarVerifyOtpResponse response = aadhaarVerificationService.verifyOtp(
                request.getReferenceId(),
                request.getOtp());
        return ResponseEntity.ok(response);
    }
}
