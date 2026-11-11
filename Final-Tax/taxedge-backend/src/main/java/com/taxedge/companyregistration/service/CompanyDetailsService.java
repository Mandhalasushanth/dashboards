package com.taxedge.companyregistration.service;

import com.taxedge.companyregistration.dto.CompanyDetailsDto;

public interface CompanyDetailsService {

	String registerCompany(CompanyDetailsDto dto);

	CompanyDetailsDto getCompanyDetails(String companyRegistrationId);

	String updateCompanyDetails(String companyRegistrationId, CompanyDetailsDto dto);

	String deleteCompanyDetails(String companyRegistrationId);
}