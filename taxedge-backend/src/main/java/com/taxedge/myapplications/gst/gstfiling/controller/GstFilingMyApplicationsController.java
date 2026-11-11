package com.taxedge.myapplications.gst.gstfiling.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.myapplications.gst.gstfiling.dto.GstFilingMyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstfiling.service.GstFilingMyApplicationsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/my-applications/gst-filing")
@RequiredArgsConstructor
@Slf4j
public class GstFilingMyApplicationsController {

    private final GstFilingMyApplicationsService gstFilingMyApplicationsService;

    @GetMapping("/{custId}")
    public ResponseEntity<List<GstFilingMyApplicationResponseDto>> getMyApplications(
            @PathVariable("custId") String pathCustId,
            @RequestHeader(value = "X-Customer-Id", required = false) String headerCustId) {
        String effectiveCustId = (headerCustId != null && !headerCustId.isBlank()) ? headerCustId : pathCustId;
        log.info("Fetching GST Filing applications for customer: {}", effectiveCustId);
        List<GstFilingMyApplicationResponseDto> applications = gstFilingMyApplicationsService.getMyGstFilingApplications(effectiveCustId);
        return ResponseEntity.ok(applications);
    }
}
