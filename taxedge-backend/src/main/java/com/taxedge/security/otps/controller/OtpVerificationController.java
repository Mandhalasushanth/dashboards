package com.taxedge.security.otps.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.security.otps.dto.SendOtpRequest;
import com.taxedge.security.otps.dto.SendOtpResponse;
import com.taxedge.security.otps.dto.VerifyOtpRequest;
import com.taxedge.security.otps.dto.VerifyOtpResponse;
import com.taxedge.security.otps.helper.OtpHelper;
import com.taxedge.security.otps.service.OtpServices;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/otps")
@RequiredArgsConstructor
public class OtpVerificationController {

    private final OtpServices otpServices;
    private final CustomerRepository customerRepository;

    @PostMapping("/send")
    public ResponseEntity<SendOtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        log.info("Received request to send OTP to: {}", OtpHelper.mask(request.getMobileNumber()));

        otpServices.sendOtp(request.getMobileNumber());

        return ResponseEntity.ok(SendOtpResponse.builder()
                .success(true)
                .message("OTP sent successfully")
                .mobileNumber(request.getMobileNumber())
                .build());
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        log.info("Received request to verify OTP for: {}", OtpHelper.mask(request.getMobileNumber()));

        boolean verified = otpServices.verifyOtp(request.getMobileNumber(), request.getCode());

        if (!verified) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(VerifyOtpResponse.builder()
                    .verified(false)
                    .isExistingUser(false)
                    .mobileNumber(request.getMobileNumber())
                    .message("Invalid or expired OTP code")
                    .build());
        }

        String nationalNumber = OtpHelper.extractNationalNumber(request.getMobileNumber());
        boolean isExisting = customerRepository.existsByMobileNumber(request.getMobileNumber())
                || customerRepository.existsByMobileNumber(nationalNumber);

        return ResponseEntity.ok(VerifyOtpResponse.builder()
                .verified(true)
                .isExistingUser(isExisting)
                .mobileNumber(request.getMobileNumber())
                .message("OTP verified successfully")
                .build());
    }
}

