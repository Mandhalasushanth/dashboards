package com.taxedge.dashboards.agents.companyregistration.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.agents.companyregistration.service.CompanyRegistrationAgentDashboardService;
import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class CompanyRegistrationAgentDashboardController {

    private final CompanyRegistrationAgentDashboardService companyRegistrationAgentDashboardService;

    @GetMapping("/company-registrations/{agentId}")
    public ResponseEntity<List<CompanyRegistrationDetailsDto>> getAssignedCompanyRegistrations(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned company registrations for agent ID [{}]", agentId);
        List<CompanyRegistrationDetailsDto> response = companyRegistrationAgentDashboardService.getAssignedCompanyRegistrationsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }
}
