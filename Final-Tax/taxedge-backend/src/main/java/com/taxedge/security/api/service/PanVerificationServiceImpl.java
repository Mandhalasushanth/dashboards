package com.taxedge.security.api.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.config.SandboxProperties;
import com.taxedge.security.api.dto.PanVerificationResponse;
import com.taxedge.security.api.helper.PanVerificationHelper;
import com.taxedge.security.api.helper.SandboxHttpExecutor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PanVerificationServiceImpl implements PanVerificationService {

    private static final String OPERATION = "PAN verification";

    private final SandboxHttpExecutor sandboxHttpExecutor;
    private final ObjectMapper objectMapper;
    private final SandboxProperties sandboxProperties;

    @Override
    public Boolean verifyPan(String pan) {
        try {
            PanVerificationResponse response = verifyPanDetails(pan);
            if (response == null || response.getData() == null) {
                return Boolean.FALSE;
            }
            return PanVerificationHelper.isValidStatus(response.getData().getStatus());
        } catch (IllegalArgumentException ex) {
            log.warn("PAN verification rejected: {}", ex.getMessage());
            return Boolean.FALSE;
        }
    }

    @Override
    public PanVerificationResponse verifyPanDetails(String pan) {

        String validatedPan = PanVerificationHelper.normaliseAndValidate(pan);
        String payload = PanVerificationHelper.buildPayload(objectMapper, validatedPan);

        String responseBody = sandboxHttpExecutor.execute(
                token -> PanVerificationHelper.buildVerifyRequest(
                        sandboxProperties.getBaseUrl(),
                        sandboxProperties.getApiKey(),
                        token,
                        payload,
                        sandboxProperties.getApiVersion()),
                OPERATION);

        PanVerificationResponse response =
                PanVerificationHelper.parseResponse(objectMapper, responseBody);

        log.info("PAN verified [{}]: status={}",
                PanVerificationHelper.maskPan(validatedPan),
                response.getData() != null ? response.getData().getStatus() : "unknown");

        return response;
    }
}
