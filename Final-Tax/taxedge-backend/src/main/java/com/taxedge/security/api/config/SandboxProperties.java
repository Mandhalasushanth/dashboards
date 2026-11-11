package com.taxedge.security.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

@Getter
@Component
public class SandboxProperties {

    @Value("${sandbox.base-url}")
    private String baseUrl;

    @Value("${sandbox.api-key}")
    private String apiKey;

    @Value("${sandbox.api-secret}")
    private String apiSecret;

    @Value("${sandbox.api-version:1.0}")
    private String apiVersion;
}

