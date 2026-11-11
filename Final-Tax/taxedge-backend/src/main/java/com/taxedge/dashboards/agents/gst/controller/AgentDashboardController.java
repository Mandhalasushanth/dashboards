 package com.taxedge.dashboards.agents.gst.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.agents.gst.service.AgentDashboardService;
import com.taxedge.dashboards.camanagers.gst.dto.AdditionalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.BankAccountAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.ContactAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstComplianceDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstFilingDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.LegalNameAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.PrincipalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.SignatoryAmendmentDetailsDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/agent")
@RequiredArgsConstructor
public class AgentDashboardController {

    private final AgentDashboardService agentDashboardService;

    @GetMapping("/gst-registrations/{agentId}")
    public ResponseEntity<List<GstRegistrationDetailsDto>> getAssignedGstRegistrations(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned GST registrations for agent ID [{}]", agentId);
        List<GstRegistrationDetailsDto> response = agentDashboardService.getAssignedGstRegistrationsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gst-filings/{agentId}")
    public ResponseEntity<List<GstFilingDetailsDto>> getAssignedGstFilings(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned GST filings for agent ID [{}]", agentId);
        List<GstFilingDetailsDto> response = agentDashboardService.getAssignedGstFilingsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gst-compliances/{agentId}")
    public ResponseEntity<List<GstComplianceDetailsDto>> getAssignedGstCompliances(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned GST compliances for agent ID [{}]", agentId);
        List<GstComplianceDetailsDto> response = agentDashboardService.getAssignedGstCompliancesByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/additional-place-amendments/{agentId}")
    public ResponseEntity<List<AdditionalPlaceAmendmentDetailsDto>> getAssignedAdditionalPlaceAmendments(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned additional place amendments for agent ID [{}]", agentId);
        List<AdditionalPlaceAmendmentDetailsDto> response = agentDashboardService.getAssignedAdditionalPlaceAmendmentsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bank-account-amendments/{agentId}")
    public ResponseEntity<List<BankAccountAmendmentDetailsDto>> getAssignedBankAccountAmendments(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned bank account amendments for agent ID [{}]", agentId);
        List<BankAccountAmendmentDetailsDto> response = agentDashboardService.getAssignedBankAccountAmendmentsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/contact-amendments/{agentId}")
    public ResponseEntity<List<ContactAmendmentDetailsDto>> getAssignedContactAmendments(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned contact amendments for agent ID [{}]", agentId);
        List<ContactAmendmentDetailsDto> response = agentDashboardService.getAssignedContactAmendmentsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/legal-name-amendments/{agentId}")
    public ResponseEntity<List<LegalNameAmendmentDetailsDto>> getAssignedLegalNameAmendments(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned legal name amendments for agent ID [{}]", agentId);
        List<LegalNameAmendmentDetailsDto> response = agentDashboardService.getAssignedLegalNameAmendmentsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/principal-place-amendments/{agentId}")
    public ResponseEntity<List<PrincipalPlaceAmendmentDetailsDto>> getAssignedPrincipalPlaceAmendments(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned principal place amendments for agent ID [{}]", agentId);
        List<PrincipalPlaceAmendmentDetailsDto> response = agentDashboardService.getAssignedPrincipalPlaceAmendmentsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/signatory-amendments/{agentId}")
    public ResponseEntity<List<SignatoryAmendmentDetailsDto>> getAssignedSignatoryAmendments(@PathVariable Long agentId) {
        log.info("REST request to fetch assigned signatory amendments for agent ID [{}]", agentId);
        List<SignatoryAmendmentDetailsDto> response = agentDashboardService.getAssignedSignatoryAmendmentsByAgentId(agentId);
        return ResponseEntity.ok(response);
    }
}

