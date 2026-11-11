package com.taxedge.security.api.service;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.api.config.SandboxProperties;
import com.taxedge.security.api.dto.GstSearchResponse;
import com.taxedge.security.api.helper.GstSearchHelper;
import com.taxedge.security.api.helper.SandboxHttpExecutor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GstSearchServiceImpl implements GstSearchService {

    private static final String OPERATION = "GST search";

    private final SandboxHttpExecutor sandboxHttpExecutor;
    private final ObjectMapper objectMapper;
    private final SandboxProperties sandboxProperties;

    @Override
    public GstSearchResponse searchGstin(String gstin) {

        String normalisedGstin = GstSearchHelper.normalise(gstin);
        String payload = GstSearchHelper.buildPayload(objectMapper, normalisedGstin);

        String responseBody = sandboxHttpExecutor.execute(
                token -> GstSearchHelper.buildRequest(
                        sandboxProperties.getBaseUrl(),
                        sandboxProperties.getApiKey(),
                        token,
                        payload,
                        sandboxProperties.getApiVersion()),
                OPERATION);

        GstSearchResponse response = GstSearchHelper.parseResponse(objectMapper, responseBody);

        String legalName = (response.getData() != null && response.getData().getData() != null)
                ? response.getData().getData().getLegalName()
                : "unknown";

        log.info("GST searched [{}]: legalName={}", normalisedGstin, legalName);

        return response;
    }

    @Override
    public Boolean verifyGstin(String gstin) {

        String normalisedGstin = GstSearchHelper.normalise(gstin);
        String payload = GstSearchHelper.buildPayload(objectMapper, normalisedGstin);

        String responseBody = sandboxHttpExecutor.execute(
                token -> GstSearchHelper.buildRequest(
                        sandboxProperties.getBaseUrl(),
                        sandboxProperties.getApiKey(),
                        token,
                        payload,
                        sandboxProperties.getApiVersion()),
                OPERATION);

        GstSearchResponse response = GstSearchHelper.parseResponse(objectMapper, responseBody);

        if (response.getData() == null || response.getData().getData() == null) {
            log.warn("GST search [{}]: no record returned", normalisedGstin);
            return Boolean.FALSE;
        }

        GstSearchResponse.GstBusinessDetails taxpayer = response.getData().getData();
        boolean matches = normalisedGstin.equalsIgnoreCase(taxpayer.getGstin());

        log.info("GST searched [{}]: returnedGstin={}, legalName={}, status={}, match={}",
                normalisedGstin, taxpayer.getGstin(), taxpayer.getLegalName(),
                taxpayer.getStatus(), matches);

        return matches;
    }
}
