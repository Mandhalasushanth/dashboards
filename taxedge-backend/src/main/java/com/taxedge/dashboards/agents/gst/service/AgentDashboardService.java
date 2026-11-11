package com.taxedge.dashboards.agents.gst.service;

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

public interface AgentDashboardService {

    List<GstRegistrationDetailsDto> getAssignedGstRegistrationsByAgentId(Long agentId);

    List<GstFilingDetailsDto> getAssignedGstFilingsByAgentId(Long agentId);

    List<GstComplianceDetailsDto> getAssignedGstCompliancesByAgentId(Long agentId);

    List<AdditionalPlaceAmendmentDetailsDto> getAssignedAdditionalPlaceAmendmentsByAgentId(Long agentId);

    List<BankAccountAmendmentDetailsDto> getAssignedBankAccountAmendmentsByAgentId(Long agentId);

    List<ContactAmendmentDetailsDto> getAssignedContactAmendmentsByAgentId(Long agentId);

    List<LegalNameAmendmentDetailsDto> getAssignedLegalNameAmendmentsByAgentId(Long agentId);

    List<PrincipalPlaceAmendmentDetailsDto> getAssignedPrincipalPlaceAmendmentsByAgentId(Long agentId);

    List<SignatoryAmendmentDetailsDto> getAssignedSignatoryAmendmentsByAgentId(Long agentId);
}

