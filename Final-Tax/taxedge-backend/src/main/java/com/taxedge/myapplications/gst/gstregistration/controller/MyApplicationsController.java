package com.taxedge.myapplications.gst.gstregistration.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.taxedge.myapplications.gst.gstregistration.dto.MyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstregistration.service.MyApplicationsService;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/my-applications/gst-registration")
@RequiredArgsConstructor
@Slf4j
public class MyApplicationsController {

    private final MyApplicationsService myApplicationsService;

    /**
     * Get applications by custId path variable with Bearer Token authentication.
     * URL: GET /api/v1/my-applications/gst-registration/{custId}
     */
    @GetMapping("/{custId}")
    public ResponseEntity<List<MyApplicationResponseDto>> getMyApplicationsByCustId(
            @PathVariable String custId,
            @AuthenticationPrincipal JwtPrincipal principal) {

        if (principal == null || principal.custId() == null || principal.custId().isBlank()) {
            log.warn("Unauthorized request to /api/v1/my-applications/gst-registration/{}: Missing customer principal", custId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication context");
        }

        if (!custId.equalsIgnoreCase(principal.custId())) {
            log.warn("Forbidden access attempt: Customer {} tried to access applications for {}", principal.custId(), custId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: You can only view your own applications");
        }

        log.info("Fetching GST Registration applications for customer: {}", custId);
        List<MyApplicationResponseDto> response = myApplicationsService.getMyApplications(custId);
        return ResponseEntity.ok(response != null ? response : Collections.emptyList());
    }
}
