package com.taxedge.dashboards.agents.companyregistration.service;

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
public class CompanyRegistrationAgentDashboardServiceImpl implements CompanyRegistrationAgentDashboardService {

    private final CompanyDetailsRepository companyDetailsRepository;
    private final CompanyRegistrationDetailsAssembler companyRegistrationDetailsAssembler;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRegistrationDetailsDto> getAssignedCompanyRegistrationsByAgentId(Long agentId) {
        log.info("Fetching assigned company registrations for agent ID [{}]", agentId);

        List<CompanyDetails> companies = companyDetailsRepository.findByAssignedAgentId(agentId);

        return companyRegistrationDetailsAssembler.toDetails(companies);
    }
}
