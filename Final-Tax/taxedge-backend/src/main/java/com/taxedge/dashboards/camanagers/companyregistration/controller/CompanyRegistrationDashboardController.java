package com.taxedge.dashboards.camanagers.companyregistration.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.companyregistration.service.CompanyRegistrationDashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/ca-manager")
@RequiredArgsConstructor
public class CompanyRegistrationDashboardController {

    private final CompanyRegistrationDashboardService companyRegistrationDashboardService;

    @GetMapping("/company-registrations")
    public ResponseEntity<List<CompanyRegistrationDetailsDto>> getAllCompanyRegistrations() {
        log.info("REST request to fetch all company registrations for CA Manager dashboard");
        List<CompanyRegistrationDetailsDto> response = companyRegistrationDashboardService.getAllCompanyRegistrationDetails();
        return ResponseEntity.ok(response);
    }
}
