package com.taxedge.dashboards.camanagers.itr.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.camanagers.itr.dto.ItrFilingDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.RevisedItrApplicationDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.TdsRefundDetailsDto;
import com.taxedge.dashboards.camanagers.itr.service.ItrDashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/ca-manager")
@RequiredArgsConstructor
public class ItrDashboardController {

    private final ItrDashboardService itrDashboardService;

    @GetMapping("/tds-refunds")
    public ResponseEntity<List<TdsRefundDetailsDto>> getAllTdsRefunds() {
        log.info("REST request to fetch all TDS refund applications for CA Manager dashboard");
        List<TdsRefundDetailsDto> response = itrDashboardService.getAllTdsRefundDetails();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/itr-filings")
    public ResponseEntity<List<ItrFilingDetailsDto>> getAllItrFilings() {
        log.info("REST request to fetch all ITR filings with linked details for CA Manager dashboard");
        List<ItrFilingDetailsDto> response = itrDashboardService.getAllItrFilingDetails();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/revised-itrs")
    public ResponseEntity<List<RevisedItrApplicationDetailsDto>> getAllRevisedItrs() {
        log.info("REST request to fetch all revised ITR applications with linked details for CA Manager dashboard");
        List<RevisedItrApplicationDetailsDto> response = itrDashboardService.getAllRevisedItrDetails();
        return ResponseEntity.ok(response);
    }
}
