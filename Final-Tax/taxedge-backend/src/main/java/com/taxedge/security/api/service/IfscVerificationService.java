package com.taxedge.security.api.service;

import com.taxedge.security.api.dto.IfscVerificationResponse;

public interface IfscVerificationService {

    IfscVerificationResponse verifyIfsc(String ifsc);
}