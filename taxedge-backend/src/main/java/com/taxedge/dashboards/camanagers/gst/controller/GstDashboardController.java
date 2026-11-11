package com.taxedge.dashboards.camanagers.gst.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.camanagers.gst.dto.AdditionalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.BankAccountAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.ContactAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstComplianceDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstFilingDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.LegalNameAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.PrincipalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.SignatoryAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.service.GstDashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/ca-manager")
@RequiredArgsConstructor
public class GstDashboardController {

    private final GstDashboardService gstDashboardService;

    @GetMapping("/gst-registrations")
    public ResponseEntity<List<GstRegistrationDetailsDto>> getAllGstRegistrations() {
        log.info("REST request to fetch all GST registration applications for CA Manager dashboard");
        List<GstRegistrationDetailsDto> response = gstDashboardService.getAllGstRegistrationDetails();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gst-filings")
    public ResponseEntity<List<GstFilingDetailsDto>> getAllGstFilings() {
        log.info("REST request to fetch all GST filing applications for CA Manager dashboard");
        List<GstFilingDetailsDto> response = gstDashboardService.getAllGstFilingDetails();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/gst-compliance")
    public ResponseEntity<List<GstComplianceDetailsDto>> getAllGstCompliance() {
        log.info("REST request to fetch all GST compliance records for CA Manager dashboard");
        List<GstComplianceDetailsDto> response = gstDashboardService.getAllLegalGstCompliance();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/legal-name-amendments")
    public ResponseEntity<List<LegalNameAmendmentDetailsDto>> getAllLegalNameAmendments() {
        log.info("REST request to fetch all legal name amendments for CA Manager dashboard");
        List<LegalNameAmendmentDetailsDto> response = gstDashboardService.getAllLegalNameAmendments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/additional-place-amendments")
    public ResponseEntity<List<AdditionalPlaceAmendmentDetailsDto>> getAllAdditionalPlaceAmendments() {
        log.info("REST request to fetch all additional place amendments for CA Manager dashboard");
        List<AdditionalPlaceAmendmentDetailsDto> response = gstDashboardService.getAllAdditionalPlaceAmendments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bank-account-amendments")
    public ResponseEntity<List<BankAccountAmendmentDetailsDto>> getAllBankAccountAmendments() {
        log.info("REST request to fetch all bank account amendments for CA Manager dashboard");
        List<BankAccountAmendmentDetailsDto> response = gstDashboardService.getAllBankAccountAmendments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/contact-amendments")
    public ResponseEntity<List<ContactAmendmentDetailsDto>> getAllContactAmendments() {
        log.info("REST request to fetch all contact amendments for CA Manager dashboard");
        List<ContactAmendmentDetailsDto> response = gstDashboardService.getAllContactAmendments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/principal-place-amendments")
    public ResponseEntity<List<PrincipalPlaceAmendmentDetailsDto>> getAllPrincipalPlaceAmendments() {
        log.info("REST request to fetch all principal place amendments for CA Manager dashboard");
        List<PrincipalPlaceAmendmentDetailsDto> response = gstDashboardService.getAllPrincipalPlaceAmendments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/signatory-amendments")
    public ResponseEntity<List<SignatoryAmendmentDetailsDto>> getAllSignatoryAmendments() {
        log.info("REST request to fetch all signatory amendments for CA Manager dashboard");
        List<SignatoryAmendmentDetailsDto> response = gstDashboardService.getAllSignatoryAmendments();
        return ResponseEntity.ok(response);
    }
}
