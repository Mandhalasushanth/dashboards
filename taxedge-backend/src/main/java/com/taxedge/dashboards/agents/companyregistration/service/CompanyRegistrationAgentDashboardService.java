package com.taxedge.dashboards.agents.companyregistration.service;

import java.util.List;

import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;

public interface CompanyRegistrationAgentDashboardService {

    List<CompanyRegistrationDetailsDto> getAssignedCompanyRegistrationsByAgentId(Long agentId);
}
