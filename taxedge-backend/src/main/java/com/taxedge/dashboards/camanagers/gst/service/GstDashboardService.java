package com.taxedge.dashboards.camanagers.gst.service;

import java.util.List;

import com.taxedge.dashboards.camanagers.gst.dto.AdditionalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.BankAccountAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.ContactAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstComplianceDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstFilingDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.LegalNameAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.PrincipalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.SignatoryAmendmentDetailsDto;

public interface GstDashboardService {

    List<GstRegistrationDetailsDto> getAllGstRegistrationDetails();

    List<GstFilingDetailsDto> getAllGstFilingDetails();

    List<GstComplianceDetailsDto> getAllLegalGstCompliance();

    List<LegalNameAmendmentDetailsDto> getAllLegalNameAmendments();

    List<AdditionalPlaceAmendmentDetailsDto> getAllAdditionalPlaceAmendments();

    List<BankAccountAmendmentDetailsDto> getAllBankAccountAmendments();

    List<ContactAmendmentDetailsDto> getAllContactAmendments();

    List<PrincipalPlaceAmendmentDetailsDto> getAllPrincipalPlaceAmendments();

    List<SignatoryAmendmentDetailsDto> getAllSignatoryAmendments();
}
