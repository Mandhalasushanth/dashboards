package com.taxedge.security.api.service;

import com.taxedge.security.api.dto.AadhaarOtpResponse;
import com.taxedge.security.api.dto.AadhaarVerifyOtpResponse;

public interface AadhaarVerificationService {

    AadhaarOtpResponse generateOtp(String aadhaarNumber);

    AadhaarVerifyOtpResponse verifyOtp(String referenceId, String otp);
}
