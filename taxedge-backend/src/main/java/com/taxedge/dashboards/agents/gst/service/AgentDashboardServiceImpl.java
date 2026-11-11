package com.taxedge.dashboards.agents.gst.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.camanagers.gst.dto.AdditionalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.BankAccountAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.ContactAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstComplianceDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstFilingDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.LegalNameAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.PrincipalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.SignatoryAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.mapper.AmendmentDetailsMapper;
import com.taxedge.dashboards.camanagers.gst.mapper.GstComplianceDetailsMapper;
import com.taxedge.dashboards.camanagers.gst.mapper.GstFilingDetailsMapper;
import com.taxedge.dashboards.camanagers.gst.mapper.GstRegistrationDetailsMapper;
import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;
import com.taxedge.gst.amendment.repository.AdditionalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.BankAccountAmendmentRepository;
import com.taxedge.gst.amendment.repository.ContactAmendmentRepository;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
import com.taxedge.gst.amendment.repository.PrincipalPlaceAmendmentRepository;
import com.taxedge.gst.amendment.repository.SignatoryAmendmentRepository;
import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.repository.BusinessRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AgentDashboardServiceImpl implements AgentDashboardService {

    private final BusinessRepository businessRepository;
    private final GstRegistrationDetailsMapper gstRegistrationDetailsMapper;
    private final GstFilingRepository gstFilingRepository;
    private final GstFilingDetailsMapper gstFilingDetailsMapper;
    private final GstComplianceRepository gstComplianceRepository;
    private final GstComplianceDetailsMapper gstComplianceDetailsMapper;
    private final AdditionalPlaceAmendmentRepository additionalPlaceAmendmentRepository;
    private final BankAccountAmendmentRepository bankAccountAmendmentRepository;
    private final ContactAmendmentRepository contactAmendmentRepository;
    private final LegalNameAmendmentRepository legalNameAmendmentRepository;
    private final PrincipalPlaceAmendmentRepository principalPlaceAmendmentRepository;
    private final SignatoryAmendmentRepository signatoryAmendmentRepository;
    private final AmendmentDetailsMapper amendmentDetailsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GstRegistrationDetailsDto> getAssignedGstRegistrationsByAgentId(Long agentId) {
        log.info("Fetching assigned GST registrations for agent ID [{}]", agentId);

        List<Business> businesses = businessRepository.findByAssignedAgentId(agentId);

        if (businesses == null || businesses.isEmpty()) {
            return Collections.emptyList();
        }

        return gstRegistrationDetailsMapper.toDtoList(businesses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GstFilingDetailsDto> getAssignedGstFilingsByAgentId(Long agentId) {
        log.info("Fetching assigned GST filings for agent ID [{}]", agentId);

        List<GstFiling> filings = gstFilingRepository.findByAssignedAgentId(agentId);

        if (filings == null || filings.isEmpty()) {
            return Collections.emptyList();
        }

        return gstFilingDetailsMapper.toDtoList(filings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GstComplianceDetailsDto> getAssignedGstCompliancesByAgentId(Long agentId) {
        log.info("Fetching assigned GST compliances for agent ID [{}]", agentId);

        List<GstCompliance> compliances = gstComplianceRepository.findByAssignedAgentId(agentId);

        if (compliances == null || compliances.isEmpty()) {
            return Collections.emptyList();
        }

        return gstComplianceDetailsMapper.toDtoList(compliances);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdditionalPlaceAmendmentDetailsDto> getAssignedAdditionalPlaceAmendmentsByAgentId(Long agentId) {
        log.info("Fetching assigned additional place amendments for agent ID [{}]", agentId);

        List<AdditionalPlaceAmendmentEntity> amendments = additionalPlaceAmendmentRepository.findByAssignedAgentId(agentId);

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toAdditionalPlaceDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountAmendmentDetailsDto> getAssignedBankAccountAmendmentsByAgentId(Long agentId) {
        log.info("Fetching assigned bank account amendments for agent ID [{}]", agentId);

        List<BankAccountAmendmentEntity> amendments = bankAccountAmendmentRepository.findByAssignedAgentId(agentId);

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toBankAccountDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactAmendmentDetailsDto> getAssignedContactAmendmentsByAgentId(Long agentId) {
        log.info("Fetching assigned contact amendments for agent ID [{}]", agentId);

        List<ContactAmendmentEntity> amendments = contactAmendmentRepository.findByAssignedAgentId(agentId);

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toContactDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LegalNameAmendmentDetailsDto> getAssignedLegalNameAmendmentsByAgentId(Long agentId) {
        log.info("Fetching assigned legal name amendments for agent ID [{}]", agentId);

        List<LegalNameAmendmentEntity> amendments = legalNameAmendmentRepository.findByAssignedAgentId(agentId);

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrincipalPlaceAmendmentDetailsDto> getAssignedPrincipalPlaceAmendmentsByAgentId(Long agentId) {
        log.info("Fetching assigned principal place amendments for agent ID [{}]", agentId);

        List<PrincipalPlaceAmendmentEntity> amendments = principalPlaceAmendmentRepository.findByAssignedAgentId(agentId);

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toPrincipalPlaceDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignatoryAmendmentDetailsDto> getAssignedSignatoryAmendmentsByAgentId(Long agentId) {
        log.info("Fetching assigned signatory amendments for agent ID [{}]", agentId);

        List<SignatoryAmendmentEntity> amendments = signatoryAmendmentRepository.findByAssignedAgentId(agentId);

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toSignatoryDtoList(amendments);
    }
}

