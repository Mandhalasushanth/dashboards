package com.taxedge.dashboards.camanagers.companyregistration.service;

import java.util.List;

import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;

public interface CompanyRegistrationDashboardService {

    List<CompanyRegistrationDetailsDto> getAllCompanyRegistrationDetails();
}
