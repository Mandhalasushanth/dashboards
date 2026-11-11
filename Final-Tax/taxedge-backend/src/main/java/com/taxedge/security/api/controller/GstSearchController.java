package com.taxedge.security.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.security.api.dto.GstSearchResponse;
import com.taxedge.security.api.dto.VerifyGstinRequest;
import com.taxedge.security.api.service.GstSearchService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/gst")
@RequiredArgsConstructor
public class GstSearchController {

    private final GstSearchService gstSearchService;

    @PostMapping("/search")
    public ResponseEntity<GstSearchResponse> searchGstin(@Valid @RequestBody VerifyGstinRequest request) {
        log.info("Received request to search GSTIN: {}", request.getGstin());
        GstSearchResponse response = gstSearchService.searchGstin(request.getGstin());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyGstin(@Valid @RequestBody VerifyGstinRequest request) {
        return ResponseEntity.ok(gstSearchService.verifyGstin(request.getGstin()));
    }
}