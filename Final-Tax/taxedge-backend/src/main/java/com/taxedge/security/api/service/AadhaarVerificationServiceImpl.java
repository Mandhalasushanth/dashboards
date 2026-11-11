package com.taxedge.security.api.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.config.SandboxProperties;
import com.taxedge.security.api.dto.AadhaarOtpResponse;
import com.taxedge.security.api.dto.AadhaarVerifyOtpResponse;
import com.taxedge.security.api.helper.AadhaarVerificationHelper;
import com.taxedge.security.api.helper.SandboxHttpExecutor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AadhaarVerificationServiceImpl implements AadhaarVerificationService {

    private static final String OPERATION_OTP = "Aadhaar OTP generation";
    private static final String OPERATION_VERIFY = "Aadhaar OTP verification";

    private final SandboxHttpExecutor sandboxHttpExecutor;
    private final ObjectMapper objectMapper;
    private final SandboxProperties sandboxProperties;

    @Override
    public AadhaarOtpResponse generateOtp(String aadhaarNumber) {

        String aadhaar = AadhaarVerificationHelper.normaliseAndValidate(aadhaarNumber);
        String payload = AadhaarVerificationHelper.buildOtpPayload(objectMapper, aadhaar);

        String responseBody = sandboxHttpExecutor.execute(
                token -> AadhaarVerificationHelper.buildOtpRequest(
                        sandboxProperties.getBaseUrl(),
                        sandboxProperties.getApiKey(),
                        token,
                        payload,
                        sandboxProperties.getApiVersion()),
                OPERATION_OTP);

        AadhaarOtpResponse response =
                AadhaarVerificationHelper.parseOtpResponse(objectMapper, responseBody);

        AadhaarOtpResponse.Data data = response.getData();

        log.info("Aadhaar OTP generated [{}]: referenceId={}, txnId={}",
                AadhaarVerificationHelper.maskAadhaar(aadhaar),
                data != null ? data.getReferenceId() : null, response.getTransactionId());

        return response;
    }

    @Override
    public AadhaarVerifyOtpResponse verifyOtp(String referenceId, String otp) {

        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("OTP is required");
        }

        String payload = AadhaarVerificationHelper.buildVerifyOtpPayload(objectMapper, referenceId, otp);

        String responseBody = sandboxHttpExecutor.execute(
                token -> AadhaarVerificationHelper.buildVerifyOtpRequest(
                        sandboxProperties.getBaseUrl(),
                        sandboxProperties.getApiKey(),
                        token,
                        payload,
                        sandboxProperties.getApiVersion()),
                OPERATION_VERIFY);

        AadhaarVerifyOtpResponse response =
                AadhaarVerificationHelper.parseVerifyOtpResponse(objectMapper, responseBody);

        log.info("Aadhaar OTP verified for referenceId={}: status={}",
                referenceId,
                response.getData() != null ? response.getData().getStatus() : "unknown");

        return response;
    }
}
