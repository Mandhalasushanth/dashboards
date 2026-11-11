package com.taxedge.security.api.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.config.SandboxProperties;
import com.taxedge.security.api.dto.IfscVerificationResponse;
import com.taxedge.security.api.helper.IfscVerificationHelper;
import com.taxedge.security.api.helper.SandboxHttpExecutor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class IfscVerificationServiceImpl implements IfscVerificationService {

    private static final String OPERATION = "IFSC verification";

    private final SandboxHttpExecutor sandboxHttpExecutor;
    private final ObjectMapper objectMapper;
    private final SandboxProperties sandboxProperties;

    @Override
    public IfscVerificationResponse verifyIfsc(String ifsc) {

        String normalisedIfsc = IfscVerificationHelper.normalise(ifsc);

        String responseBody = sandboxHttpExecutor.execute(
                token -> IfscVerificationHelper.buildIfscRequest(
                        sandboxProperties.getBaseUrl(),
                        sandboxProperties.getApiKey(),
                        token,
                        normalisedIfsc,
                        sandboxProperties.getApiVersion()),
                OPERATION);

        IfscVerificationResponse response =
                IfscVerificationHelper.parseResponse(objectMapper, responseBody);

        log.info("IFSC verified [{}]: bank={}, branch={}",
                normalisedIfsc, response.getBank(), response.getBranch());

        return response;
    }
}