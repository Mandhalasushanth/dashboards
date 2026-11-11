package com.taxedge.dashboards.camanagers.gst.service;

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
public class GstDashboardServiceImpl implements GstDashboardService {

    private final BusinessRepository businessRepository;
    private final GstRegistrationDetailsMapper gstRegistrationDetailsMapper;
    private final GstFilingRepository gstFilingRepository;
    private final GstFilingDetailsMapper gstFilingDetailsMapper;
    private final GstComplianceRepository gstComplianceRepository;
    private final GstComplianceDetailsMapper gstComplianceDetailsMapper;
    private final LegalNameAmendmentRepository legalNameAmendmentRepository;
    private final AdditionalPlaceAmendmentRepository additionalPlaceAmendmentRepository;
    private final BankAccountAmendmentRepository bankAccountAmendmentRepository;
    private final ContactAmendmentRepository contactAmendmentRepository;
    private final PrincipalPlaceAmendmentRepository principalPlaceAmendmentRepository;
    private final SignatoryAmendmentRepository signatoryAmendmentRepository;
    private final AmendmentDetailsMapper amendmentDetailsMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GstRegistrationDetailsDto> getAllGstRegistrationDetails() {
        log.info("Fetching all GST registration records with linked documents and customer details for CA Manager dashboard");

        List<Business> businesses = businessRepository.findAllWithDocuments();

        if (businesses == null || businesses.isEmpty()) {
            return Collections.emptyList();
        }

        return gstRegistrationDetailsMapper.toDtoList(businesses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GstFilingDetailsDto> getAllGstFilingDetails() {
        log.info("Fetching all GST filing records with linked documents and customer details for CA Manager dashboard");

        List<GstFiling> filings = gstFilingRepository.findAllWithDocuments();

        if (filings == null || filings.isEmpty()) {
            return Collections.emptyList();
        }

        return gstFilingDetailsMapper.toDtoList(filings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GstComplianceDetailsDto> getAllLegalGstCompliance() {
        log.info("Fetching all GST compliance records with linked customer details for CA Manager dashboard");

        List<GstCompliance> compliances = gstComplianceRepository.findAllWithCustomer();

        if (compliances == null || compliances.isEmpty()) {
            return Collections.emptyList();
        }

        return gstComplianceDetailsMapper.toDtoList(compliances);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LegalNameAmendmentDetailsDto> getAllLegalNameAmendments() {
        log.info("Fetching all legal name amendments with linked customer details for CA Manager dashboard");

        List<LegalNameAmendmentEntity> amendments = legalNameAmendmentRepository.findAllWithCustomer();

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdditionalPlaceAmendmentDetailsDto> getAllAdditionalPlaceAmendments() {
        log.info("Fetching all additional place amendments with linked customer details for CA Manager dashboard");

        List<AdditionalPlaceAmendmentEntity> amendments = additionalPlaceAmendmentRepository.findAllWithCustomer();

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toAdditionalPlaceDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BankAccountAmendmentDetailsDto> getAllBankAccountAmendments() {
        log.info("Fetching all bank account amendments with linked customer details for CA Manager dashboard");

        List<BankAccountAmendmentEntity> amendments = bankAccountAmendmentRepository.findAllWithCustomer();

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toBankAccountDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactAmendmentDetailsDto> getAllContactAmendments() {
        log.info("Fetching all contact amendments with linked customer details for CA Manager dashboard");

        List<ContactAmendmentEntity> amendments = contactAmendmentRepository.findAllWithCustomer();

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toContactDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrincipalPlaceAmendmentDetailsDto> getAllPrincipalPlaceAmendments() {
        log.info("Fetching all principal place amendments with linked customer details for CA Manager dashboard");

        List<PrincipalPlaceAmendmentEntity> amendments = principalPlaceAmendmentRepository.findAllWithCustomer();

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toPrincipalPlaceDtoList(amendments);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SignatoryAmendmentDetailsDto> getAllSignatoryAmendments() {
        log.info("Fetching all signatory amendments with linked customer details for CA Manager dashboard");

        List<SignatoryAmendmentEntity> amendments = signatoryAmendmentRepository.findAllWithCustomer();

        if (amendments == null || amendments.isEmpty()) {
            return Collections.emptyList();
        }

        return amendmentDetailsMapper.toSignatoryDtoList(amendments);
    }
}
