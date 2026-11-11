package com.taxedge.loan.businessloan.service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.businessloan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanDraftDocumentDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanDraftDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanProfileDto;
import com.taxedge.loan.businessloan.entity.BusinessLoanApplication;
import com.taxedge.loan.businessloan.entity.BusinessLoanProfile;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;
import com.taxedge.loan.businessloan.enums.LoanPurpose;
import com.taxedge.loan.businessloan.helper.BusinessLoanHelper;
import com.taxedge.loan.businessloan.mapper.BusinessLoanApplicationMapper;
import com.taxedge.loan.businessloan.mapper.BusinessLoanProfileMapper;
import com.taxedge.loan.businessloan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanBankingRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanDocumentMetadataProjection;
import com.taxedge.loan.businessloan.repository.BusinessLoanDocumentRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanProfileRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessLoanApplicationServiceImpl implements BusinessLoanApplicationService {

    private static final Set<LoanPurpose> DATABASE_SUPPORTED_PURPOSES = Set.of(
            LoanPurpose.BUSINESS_EXPANSION,
            LoanPurpose.WORKING_CAPITAL_INVENTORY,
            LoanPurpose.MACHINERY_EQUIPMENT_PURCHASE,
            LoanPurpose.HOME_PURCHASE_CONSTRUCTION,
            LoanPurpose.HOME_RENOVATION,
            LoanPurpose.VEHICLE_PURCHASE,
            LoanPurpose.DEBT_CONSOLIDATION,
            LoanPurpose.PERSONAL_MEDICAL_EMERGENCY);

    private final BusinessLoanApplicationRepository repository;
    private final CustomerRepository customerRepository;
    private final BusinessLoanApplicationMapper mapper;
    private final BusinessLoanProfileMapper profileMapper;
    private final BusinessLoanDocumentRepository documentRepository;
    private final BusinessLoanProfileRepository profileRepository;
    private final BusinessLoanBankingRepository bankingRepository;

    @Override
    @Transactional
    public String saveApplication(BusinessLoanApplicationDto dto) {
        validateLoanPurpose(dto.getLoanPurpose());
        String custId = currentCustomerId();

        Customer customer = customerRepository.findByCustIdForUpdate(custId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated customer not found"));

        BusinessLoanApplication entity;
        if (StringUtils.hasText(dto.getId())) {
            entity = repository.findByIdAndCustomer_CustId(dto.getId().trim(), custId)
                    .orElseThrow(() -> new ResourceNotFoundException("Draft not found"));
            if (entity.getStatus() != LoanApplicationStatus.DRAFT) {
                throw new IllegalStateException("Only a draft can be updated");
            }
            mapper.replaceDraftFromDto(dto, entity);
        } else {
            var activeDraft = repository.findFirstByCustomer_CustIdAndStatusOrderByLastActivityAtDesc(
                    custId, LoanApplicationStatus.DRAFT);
            if (activeDraft.isPresent()) {
                entity = activeDraft.get();
                mapper.replaceDraftFromDto(dto, entity);
            } else {
                entity = mapper.toEntity(dto);
                int year = Year.now().getValue();
                long seq = repository.getNextSequenceValue();
                entity.setId(BusinessLoanHelper.formatLoanApplicationId(year, seq));
                entity.setCustomer(customer);
            }
        }
        entity.setCustomer(customer);
        entity.setStatus(LoanApplicationStatus.DRAFT);

        String id = repository.save(entity).getId();
        saveProfile(dto.getBusinessProfile(), entity);
        log.info("Business loan draft saved for authenticated customer");

        return id;
    }

    private void validateLoanPurpose(LoanPurpose loanPurpose) {
        if (loanPurpose != null && !DATABASE_SUPPORTED_PURPOSES.contains(loanPurpose)) {
            throw new IllegalArgumentException(
                    "The selected Business Loan purpose is not supported by the current application API.");
        }
    }

    @Override
    @Transactional
    public String updateApplication(String id, BusinessLoanApplicationDto dto) {
        validateLoanPurpose(dto.getLoanPurpose());
        BusinessLoanApplication entity = findForUpdate(id);
        if (entity.getStatus() != LoanApplicationStatus.DRAFT) {
            throw new IllegalStateException("Only a draft can be edited");
        }

        LoanApplicationStatus currentStatus = entity.getStatus();
        mapper.updateFromDto(dto, entity);
        entity.setStatus(currentStatus);

        log.info("Business loan application updated: {}", id);
        return id;
    }

    @Override
    public BusinessLoanApplicationDto getApplication(String id) {
        return mapper.toDto(findOrThrow(id));
    }

    @Override
    @Transactional
    public Optional<BusinessLoanDraftDto> getCurrentDraft() {
        String custId = currentCustomerId();
        var currentDraft = repository
                .findFirstByCustomer_CustIdAndStatusOrderByLastActivityAtDesc(
                        custId, LoanApplicationStatus.DRAFT);
        if (currentDraft.isEmpty()) {
            return Optional.empty();
        }
        BusinessLoanApplication application = currentDraft.get();
        application.setLastActivityAt(LocalDateTime.now());
        repository.save(application);

        BusinessLoanProfileDto profile = profileRepository.findByLoanApplication_Id(application.getId())
                .map(profileMapper::toDto)
                .orElse(null);
        var documents = documentRepository.findDraftDocumentMetadataByLoanApplicationId(application.getId())
                .map(this::documentMetadata)
                .orElseGet(ArrayList::new);
        return Optional.of(BusinessLoanDraftDto.builder()
                .application(mapper.toDto(application))
                .businessProfile(profile)
                .documents(documents)
                .build());
    }

    @Override
    @Transactional
    public String submitDraft(String id) {
        BusinessLoanApplication application = repository
                .findByIdAndCustomer_CustIdForUpdate(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Business loan draft not found"));
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED) {
            return application.getId();
        }
        if (application.getStatus() != LoanApplicationStatus.DRAFT) {
            throw new IllegalStateException("Only a draft can be submitted");
        }
        application.setStatus(LoanApplicationStatus.SUBMITTED);
        application.setLastActivityAt(LocalDateTime.now());
        return repository.save(application).getId();
    }

    @Override
    @Transactional
    public void deleteApplication(String id) {
        BusinessLoanApplication entity = findForUpdate(id);
        if (entity.getStatus() != LoanApplicationStatus.DRAFT) {
            throw new IllegalStateException("Only a draft can be deleted");
        }
        documentRepository.deleteByLoanApplication_Id(id);
        profileRepository.deleteByLoanApplication_Id(id);
        bankingRepository.deleteByLoanApplication_Id(id);
        repository.delete(entity);
        log.info("Deleted business loan application {} and associated sections", id);
    }

    private BusinessLoanApplication findOrThrow(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("Business loan application ID is required");
        }
        return repository.findByIdAndCustomer_CustId(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found: " + id));
    }

    private BusinessLoanApplication findForUpdate(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("Business loan application ID is required");
        }
        return repository.findByIdAndCustomer_CustIdForUpdate(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));
    }

    private void saveProfile(BusinessLoanProfileDto dto, BusinessLoanApplication application) {
        if (dto == null) return;
        BusinessLoanProfile profile = profileRepository.findByLoanApplication_Id(application.getId())
                .orElseGet(() -> {
                    BusinessLoanProfile newProfile = profileMapper.toEntity(dto);
                    newProfile.setLoanApplication(application);
                    return newProfile;
                });
        if (profile.getId() != null) {
            profileMapper.replaceDraftFromDto(dto, profile);
        }
        profile.setLoanApplication(application);
        profileRepository.save(profile);
    }

    private ArrayList<BusinessLoanDraftDocumentDto> documentMetadata(
            BusinessLoanDocumentMetadataProjection document) {
        ArrayList<BusinessLoanDraftDocumentDto> metadata = new ArrayList<>();
        addMetadata(metadata, "pan_card", document.getPanCardFileSize(),
                document.getPanCardFileName(), document.getPanCardContentType());
        addMetadata(metadata, "business_proof", document.getBusinessRegistrationFileSize(),
                document.getBusinessRegistrationFileName(), document.getBusinessRegistrationContentType());
        addMetadata(metadata, "bank_statement", document.getBankStatementsFileSize(),
                document.getBankStatementsFileName(), document.getBankStatementsContentType());
        addMetadata(metadata, "project_quotation", document.getBusinessExpansionFileSize(),
                document.getBusinessExpansionFileName(), document.getBusinessExpansionContentType());
        addMetadata(metadata, "gst_certificate", document.getGstCertificateFileSize(),
                document.getGstCertificateFileName(), document.getGstCertificateContentType());
        addMetadata(metadata, "financial_statements", document.getFinancialStatementsFileSize(),
                document.getFinancialStatementsFileName(), document.getFinancialStatementsContentType());
        return metadata;
    }

    private void addMetadata(ArrayList<BusinessLoanDraftDocumentDto> metadata, String id, Integer fileSize,
            String fileName, String contentType) {
        if (fileSize != null) {
            metadata.add(BusinessLoanDraftDocumentDto.builder()
            .documentId(id)
            .fileName(fileName == null ? id : fileName)
            .contentType(contentType == null ? "application/octet-stream" : contentType)
            .fileSize(fileSize.longValue())
            .build());
        }
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtPrincipal principal)
                || !StringUtils.hasText(principal.custId())) {
            throw new AccessDeniedException("An authenticated customer is required");
        }
        return principal.custId();
    }
}
