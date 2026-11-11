package com.taxedge.myapplications.gst.gstamendment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.myapplications.gst.gstamendment.dto.GstAmendmentMyApplicationResponseDto;
import com.taxedge.myapplications.gst.gstamendment.service.GstAmendmentMyApplicationsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/my-applications/gst-amendment")
@RequiredArgsConstructor
@Slf4j
public class GstAmendmentMyApplicationsController {

    private final GstAmendmentMyApplicationsService gstAmendmentMyApplicationsService;

    @GetMapping("/{custId}")
    public ResponseEntity<List<GstAmendmentMyApplicationResponseDto>> getMyApplications(
            @PathVariable("custId") String pathCustId,
            @RequestHeader(value = "X-Customer-Id", required = false) String headerCustId) {
        String effectiveCustId = (headerCustId != null && !headerCustId.isBlank()) ? headerCustId : pathCustId;
        log.info("Fetching GST Amendment applications for customer: {}", effectiveCustId);
        List<GstAmendmentMyApplicationResponseDto> applications = gstAmendmentMyApplicationsService.getMyAmendmentApplications(effectiveCustId);
        return ResponseEntity.ok(applications);
    }
}
