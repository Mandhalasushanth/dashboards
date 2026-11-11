package com.taxedge.myapplications.itr.tdsrefund.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.myapplications.itr.tdsrefund.dto.TdsRefundMyApplicationResponseDto;
import com.taxedge.myapplications.itr.tdsrefund.service.TdsRefundMyApplicationsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/my-applications/tds-refund")
@RequiredArgsConstructor
@Slf4j
public class TdsRefundMyApplicationsController {

    private final TdsRefundMyApplicationsService tdsRefundMyApplicationsService;

    @GetMapping("/{custId}")
    public ResponseEntity<List<TdsRefundMyApplicationResponseDto>> getMyTdsRefundApplications(
            @PathVariable("custId") String pathCustId,
            @RequestHeader(value = "X-Customer-Id", required = false) String headerCustId) {
        String effectiveCustId = (headerCustId != null && !headerCustId.isBlank()) ? headerCustId : pathCustId;
        log.info("Fetching TDS Refund applications for customer: {}", effectiveCustId);
        List<TdsRefundMyApplicationResponseDto> applications = tdsRefundMyApplicationsService.getMyTdsRefundApplications(effectiveCustId);
        return ResponseEntity.ok(applications);
    }
}
