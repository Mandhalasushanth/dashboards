package com.taxedge.security.otp.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.security.otp.entity.Otp;
import com.taxedge.security.otp.service.OtpService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;
    private final CustomerRepository customerRepository;

    @PostMapping("/generate")
    public ResponseEntity<String> generateOtp(@RequestBody Otp otp) {
        String result = otpService.generateOtp(otp);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestBody Otp otp) {
        if (!otpService.verifyOtp(otp)) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Invalid OTP"
            ));
        }

        boolean isExisting = customerRepository.findByMobileNumber(otp.getMobileNumber()).isPresent();

        return ResponseEntity.ok(Map.of(
            "success", true,
            "isExistingUser", isExisting,
            "customerExists", isExisting,
            "hasPasscode", isExisting,
            "message", "OTP verified successfully"
        ));
    }
}
