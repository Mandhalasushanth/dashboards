package com.taxedge.security.api.service;

import com.taxedge.security.api.dto.PanVerificationResponse;

public interface PanVerificationService {

    Boolean verifyPan(String pan);

    PanVerificationResponse verifyPanDetails(String pan);
}