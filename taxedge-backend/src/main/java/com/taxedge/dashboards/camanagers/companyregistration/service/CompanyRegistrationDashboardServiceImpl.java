package com.taxedge.dashboards.camanagers.companyregistration.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.companyregistration.mapper.CompanyRegistrationDetailsAssembler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyRegistrationDashboardServiceImpl implements CompanyRegistrationDashboardService {

    private final CompanyDetailsRepository companyDetailsRepository;
    private final CompanyRegistrationDetailsAssembler companyRegistrationDetailsAssembler;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRegistrationDetailsDto> getAllCompanyRegistrationDetails() {
        log.info("Fetching all company registrations with office, directors, shareholding, documents and customer details for CA Manager dashboard");

        List<CompanyDetails> companies = companyDetailsRepository.findAllWithCustomer();

        return companyRegistrationDetailsAssembler.toDetails(companies);
    }
}
