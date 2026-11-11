package com.taxedge.loan.businessloan.service;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.businessloan.dto.BusinessLoanDocumentContent;
import com.taxedge.loan.businessloan.dto.BusinessLoanDocumentDto;
import com.taxedge.loan.businessloan.entity.BusinessLoanApplication;
import com.taxedge.loan.businessloan.entity.BusinessLoanDocument;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;
import com.taxedge.loan.businessloan.mapper.BusinessLoanDocumentMapper;
import com.taxedge.loan.businessloan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanDocumentRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessLoanDocumentServiceImpl implements BusinessLoanDocumentService {

    private final BusinessLoanDocumentRepository repository;
    private final BusinessLoanApplicationRepository applicationRepository;
    private final BusinessLoanDocumentMapper mapper;

    @Override
    @Transactional
    public String saveDocuments(BusinessLoanDocumentDto dto) {
        BusinessLoanApplication application = getDraftApplication(dto.getLoanApplicationId());
        BusinessLoanDocument entity = mapper.toEntity(dto);
        entity.setLoanApplication(application);
        repository.save(entity);
        touch(application);
        log.info("Business Loan documents saved");
        return application.getId();
    }

    @Override
    @Transactional
    public String updateDocuments(String loanApplicationId, BusinessLoanDocumentDto dto) {
        BusinessLoanApplication application = getDraftApplication(loanApplicationId);
        BusinessLoanDocument entity = findOrThrow(loanApplicationId);
        mapper.updateFromDto(dto, entity);
        touch(application);
        log.info("Business Loan documents updated");
        return loanApplicationId;
    }

    @Override
    public BusinessLoanDocumentDto getDocuments(String loanApplicationId) {
        getOwnedApplication(loanApplicationId);
        return mapper.toDto(findOrThrow(loanApplicationId));
    }

    @Override
    @Transactional
    public void deleteDocuments(String loanApplicationId) {
        BusinessLoanApplication application = getDraftApplication(loanApplicationId);
        if (!repository.existsByLoanApplication_Id(application.getId())) {
            throw new ResourceNotFoundException("Documents not found for loan application");
        }
        repository.deleteByLoanApplication_Id(application.getId());
        touch(application);
        log.info("Business Loan documents removed from a draft");
    }

    @Override
    @Transactional
    public void uploadDraftDocument(String loanApplicationId, String documentId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A non-empty document file is required");
        }
        BusinessLoanApplication application = getDraftApplication(loanApplicationId);
        BusinessLoanDocument document = repository.findByLoanApplication_Id(application.getId())
                .orElseGet(() -> BusinessLoanDocument.builder()
                        .loanApplication(application)
                        .build());
        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to read uploaded document", ex);
        }
        String fileName = StringUtils.cleanPath(file.getOriginalFilename() == null
                ? "" : file.getOriginalFilename());
        int lastSeparator = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
        fileName = fileName.substring(lastSeparator + 1);
        String contentType = StringUtils.hasText(file.getContentType())
                ? file.getContentType() : "application/octet-stream";
        if (fileName.length() > 255 || contentType.length() > 150) {
            throw new IllegalArgumentException("Document filename or content type is too long");
        }
        switch (documentId) {
            case "pan_card" -> {
                document.setPanCardFile(content);
                document.setPanCardFileName(fileName);
                document.setPanCardContentType(contentType);
            }
            case "business_proof" -> {
                document.setBusinessRegistrationProofFile(content);
                document.setBusinessRegistrationFileName(fileName);
                document.setBusinessRegistrationContentType(contentType);
            }
            case "bank_statement" -> {
                document.setBankStatementsFile(content);
                document.setBankStatementsFileName(fileName);
                document.setBankStatementsContentType(contentType);
            }
            case "project_quotation" -> {
                document.setBusinessExpansionDocumentFile(content);
                document.setBusinessExpansionFileName(fileName);
                document.setBusinessExpansionContentType(contentType);
            }
            case "gst_certificate" -> {
                document.setGstCertificateFile(content);
                document.setGstCertificateFileName(fileName);
                document.setGstCertificateContentType(contentType);
            }
            case "financial_statements" -> {
                document.setProfitLossStatementFile(content);
                document.setProfitLossStatementFileName(fileName);
                document.setProfitLossStatementContentType(contentType);
            }
            default -> throw new IllegalArgumentException("Unsupported Business Loan document type");
        }
        repository.save(document);
        touch(application);
    }

    @Override
    @Transactional
    public void removeDraftDocument(String loanApplicationId, String documentId) {
        BusinessLoanApplication application = getDraftApplication(loanApplicationId);
        BusinessLoanDocument document = findOrThrow(application.getId());
        switch (documentId) {
            case "pan_card" -> {
                document.setPanCardFile(null);
                document.setPanCardFileName(null);
                document.setPanCardContentType(null);
            }
            case "business_proof" -> {
                document.setBusinessRegistrationProofFile(null);
                document.setBusinessRegistrationFileName(null);
                document.setBusinessRegistrationContentType(null);
            }
            case "bank_statement" -> {
                document.setBankStatementsFile(null);
                document.setBankStatementsFileName(null);
                document.setBankStatementsContentType(null);
            }
            case "project_quotation" -> {
                document.setBusinessExpansionDocumentFile(null);
                document.setBusinessExpansionFileName(null);
                document.setBusinessExpansionContentType(null);
            }
            case "gst_certificate" -> {
                document.setGstCertificateFile(null);
                document.setGstCertificateFileName(null);
                document.setGstCertificateContentType(null);
            }
            case "financial_statements" -> {
                document.setProfitLossStatementFile(null);
                document.setProfitLossStatementFileName(null);
                document.setProfitLossStatementContentType(null);
            }
            default -> throw new IllegalArgumentException("Unsupported Business Loan document type");
        }
        repository.save(document);
        touch(application);
    }

    @Override
    public BusinessLoanDocumentContent getDraftDocument(String loanApplicationId, String documentId) {
        BusinessLoanApplication application = getOwnedApplication(loanApplicationId);
        BusinessLoanDocument document = findOrThrow(application.getId());
        byte[] content;
        String fileName;
        String contentType;
        switch (documentId) {
            case "pan_card" -> {
                content = document.getPanCardFile();
                fileName = document.getPanCardFileName();
                contentType = document.getPanCardContentType();
            }
            case "business_proof" -> {
                content = document.getBusinessRegistrationProofFile();
                fileName = document.getBusinessRegistrationFileName();
                contentType = document.getBusinessRegistrationContentType();
            }
            case "bank_statement" -> {
                content = document.getBankStatementsFile();
                fileName = document.getBankStatementsFileName();
                contentType = document.getBankStatementsContentType();
            }
            case "project_quotation" -> {
                content = document.getBusinessExpansionDocumentFile();
                fileName = document.getBusinessExpansionFileName();
                contentType = document.getBusinessExpansionContentType();
            }
            case "gst_certificate" -> {
                content = document.getGstCertificateFile();
                fileName = document.getGstCertificateFileName();
                contentType = document.getGstCertificateContentType();
            }
            case "financial_statements" -> {
                content = document.getProfitLossStatementFile();
                fileName = document.getProfitLossStatementFileName();
                contentType = document.getProfitLossStatementContentType();
            }
            default -> throw new IllegalArgumentException("Unsupported Business Loan document type");
        }
        if (content == null) {
            throw new ResourceNotFoundException("Business Loan document not found");
        }
        return BusinessLoanDocumentContent.builder()
                .content(content)
                .fileName(StringUtils.hasText(fileName) ? fileName : documentId)
                .contentType(StringUtils.hasText(contentType) ? contentType : "application/octet-stream")
                .build();
    }

    private BusinessLoanApplication getDraftApplication(String loanApplicationId) {
        if (!StringUtils.hasText(loanApplicationId)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        BusinessLoanApplication application = applicationRepository.findByIdAndCustomer_CustIdForUpdate(
                        loanApplicationId.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));
        if (application.getStatus() != LoanApplicationStatus.DRAFT) {
            throw new IllegalStateException("Documents can only be changed on a draft");
        }
        return application;
    }

    private void touch(BusinessLoanApplication application) {
        application.setLastActivityAt(LocalDateTime.now());
        applicationRepository.save(application);
    }

    private BusinessLoanDocument findOrThrow(String loanApplicationId) {
        return repository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Documents not found for application"));
    }

    private BusinessLoanApplication getOwnedApplication(String loanApplicationId) {
        if (!StringUtils.hasText(loanApplicationId)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        return applicationRepository.findByIdAndCustomer_CustId(
                        loanApplicationId.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));
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
