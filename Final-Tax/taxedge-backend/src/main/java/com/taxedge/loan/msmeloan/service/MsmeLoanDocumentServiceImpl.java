package com.taxedge.loan.msmeloan.service;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.msmeloan.dto.MsmeLoanDocumentItemResponse;
import com.taxedge.loan.msmeloan.entity.MsmeLoanApplication;
import com.taxedge.loan.msmeloan.entity.MsmeLoanDocument;
import com.taxedge.loan.msmeloan.enums.MsmeDocumentType;
import com.taxedge.loan.msmeloan.repository.MsmeLoanApplicationRepository;
import com.taxedge.loan.msmeloan.repository.MsmeLoanDocumentRepository;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MsmeLoanDocumentServiceImpl implements MsmeLoanDocumentService {

    private final MsmeLoanDocumentRepository documentRepository;
    private final MsmeLoanApplicationRepository applicationRepository;

    @Override
    @Transactional
    public MsmeLoanDocumentItemResponse uploadDocument(String loanApplicationId, MsmeDocumentType documentType, MultipartFile file) {
        if (documentType == null) {
            throw new IllegalArgumentException("Document type is required");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        MsmeLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED || application.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted or approved applications cannot be modified");
        }

        try {
            MsmeLoanDocument document = documentRepository.findByLoanApplication_Id(loanApplicationId)
                    .orElseGet(() -> MsmeLoanDocument.builder().loanApplication(application).build());

            setFileContent(document, documentType, file.getBytes());
            MsmeLoanDocument saved = documentRepository.save(document);
            log.info("Document {} uploaded for MSME loan {}", documentType, loanApplicationId);

            return MsmeLoanDocumentItemResponse.builder()
                    .documentType(documentType)
                    .displayName(documentType.getDisplayName())
                    .uploaded(true)
                    .fileSize(file.getSize())
                    .uploadedAt(saved.getUpdatedAt())
                    .build();

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file contents: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public List<MsmeLoanDocumentItemResponse> uploadDocuments(String loanApplicationId, java.util.Map<String, MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one document file is required");
        }

        MsmeLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED || application.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted or approved applications cannot be modified");
        }

        MsmeLoanDocument document = documentRepository.findByLoanApplication_Id(loanApplicationId)
                .orElseGet(() -> MsmeLoanDocument.builder().loanApplication(application).build());

        boolean anyUploaded = false;
        for (java.util.Map.Entry<String, MultipartFile> entry : files.entrySet()) {
            String key = entry.getKey();
            MultipartFile file = entry.getValue();

            if (file == null || file.isEmpty() || "file".equalsIgnoreCase(key) || "documentType".equalsIgnoreCase(key)) {
                continue;
            }

            MsmeDocumentType type = MsmeDocumentType.fromKey(key).orElse(null);
            if (type != null) {
                try {
                    setFileContent(document, type, file.getBytes());
                    anyUploaded = true;
                    log.info("Document {} uploaded for MSME loan {}", type, loanApplicationId);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to read file contents for " + key + ": " + e.getMessage(), e);
                }
            } else {
                log.warn("Unrecognized MSME document type key: {}", key);
            }
        }

        if (anyUploaded) {
            documentRepository.save(document);
        }

        return getDocuments(loanApplicationId);
    }

    @Override
    public List<MsmeLoanDocumentItemResponse> getDocuments(String loanApplicationId) {
        findApplicationForCurrentCustomer(loanApplicationId);
        MsmeLoanDocument doc = documentRepository.findByLoanApplication_Id(loanApplicationId).orElse(null);

        return Arrays.stream(MsmeDocumentType.values())
                .map(type -> {
                    byte[] content = (doc != null) ? getFileContent(doc, type) : null;
                    return MsmeLoanDocumentItemResponse.builder()
                            .documentType(type)
                            .displayName(type.getDisplayName())
                            .uploaded(content != null)
                            .fileSize(content != null ? (long) content.length : null)
                            .uploadedAt(doc != null ? doc.getUpdatedAt() : null)
                            .build();
                })
                .toList();
    }

    @Override
    public byte[] downloadDocument(String loanApplicationId, MsmeDocumentType documentType) {
        findApplicationForCurrentCustomer(loanApplicationId);
        MsmeLoanDocument doc = documentRepository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Documents not found for MSME loan: " + loanApplicationId));

        byte[] content = getFileContent(doc, documentType);
        if (content == null || content.length == 0) {
            throw new ResourceNotFoundException("Document " + documentType + " not uploaded for MSME loan: " + loanApplicationId);
        }
        return content;
    }

    @Override
    @Transactional
    public void deleteDocument(String loanApplicationId, MsmeDocumentType documentType) {
        MsmeLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED || application.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted applications cannot have documents deleted");
        }
        MsmeLoanDocument doc = documentRepository.findByLoanApplication_Id(loanApplicationId).orElse(null);
        if (doc != null) {
            setFileContent(doc, documentType, null);
            documentRepository.save(doc);
            log.info("Document {} deleted for MSME loan {}", documentType, loanApplicationId);
        }
    }

    @Override
    @Transactional
    public void deleteAllDocuments(String loanApplicationId) {
        MsmeLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED || application.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted applications cannot have documents deleted");
        }
        documentRepository.deleteByLoanApplication_Id(loanApplicationId);
        log.info("Deleted all documents for MSME loan {}", loanApplicationId);
    }

    private void setFileContent(MsmeLoanDocument document, MsmeDocumentType type, byte[] data) {
        if (document == null || type == null) return;
        switch (type) {
            case PAN_CARD -> document.setPanCardFile(data);
            case AADHAAR_CARD -> document.setAadhaarCardFile(data);
            case UDYAM_CERTIFICATE -> document.setUdyamCertificateFile(data);
            case GST_CERTIFICATE -> document.setGstCertificateFile(data);
            case BANK_STATEMENTS -> document.setBankStatementsFile(data);
            case ITR_RETURNS -> document.setItrReturnsFile(data);
            case FINANCIAL_STATEMENTS -> document.setFinancialStatementsFile(data);
        }
    }

    private byte[] getFileContent(MsmeLoanDocument document, MsmeDocumentType type) {
        if (document == null || type == null) return null;
        return switch (type) {
            case PAN_CARD -> document.getPanCardFile();
            case AADHAAR_CARD -> document.getAadhaarCardFile();
            case UDYAM_CERTIFICATE -> document.getUdyamCertificateFile();
            case GST_CERTIFICATE -> document.getGstCertificateFile();
            case BANK_STATEMENTS -> document.getBankStatementsFile();
            case ITR_RETURNS -> document.getItrReturnsFile();
            case FINANCIAL_STATEMENTS -> document.getFinancialStatementsFile();
        };
    }

    private MsmeLoanApplication findApplicationForCurrentCustomer(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        return applicationRepository.findByIdAndCustomer_CustId(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("MSME loan application not found: " + id));
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
