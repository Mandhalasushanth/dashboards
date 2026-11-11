package com.taxedge.security.api.service;

import com.taxedge.security.api.dto.GstSearchResponse;

public interface GstSearchService {

    GstSearchResponse searchGstin(String gstin);
    
    Boolean verifyGstin(String gstin);
}