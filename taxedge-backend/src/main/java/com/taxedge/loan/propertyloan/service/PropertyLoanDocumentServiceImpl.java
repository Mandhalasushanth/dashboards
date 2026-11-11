package com.taxedge.loan.propertyloan.service;

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
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.propertyloan.dto.PropertyLoanDocumentItemResponse;
import com.taxedge.loan.propertyloan.entity.PropertyLoanApplication;
import com.taxedge.loan.propertyloan.entity.PropertyLoanDocument;
import com.taxedge.loan.propertyloan.enums.PropertyDocumentType;
import com.taxedge.loan.propertyloan.enums.PropertyLoanPurpose;
import com.taxedge.loan.propertyloan.repository.PropertyLoanApplicationRepository;
import com.taxedge.loan.propertyloan.repository.PropertyLoanDocumentRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyLoanDocumentServiceImpl implements PropertyLoanDocumentService {

    private final PropertyLoanDocumentRepository documentRepository;
    private final PropertyLoanApplicationRepository applicationRepository;

    @Override
    @Transactional
    public PropertyLoanDocumentItemResponse uploadDocument(String loanApplicationId,
                                                          PropertyDocumentType documentType,
                                                          MultipartFile file) {
        if (file == null || file.isEmpty() || documentType == null) {
            throw new IllegalArgumentException("Valid file and document type are required");
        }

        PropertyLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED) {
            throw new IllegalStateException("Submitted applications cannot be modified");
        }

        try {
            PropertyLoanDocument document = documentRepository
                    .findByLoanApplication_Id(loanApplicationId)
                    .orElseGet(() -> PropertyLoanDocument.builder()
                            .loanApplication(application)
                            .build());

            setFileContent(document, documentType, file.getBytes());
            PropertyLoanDocument saved = documentRepository.save(document);
            log.info("Document {} uploaded for property loan {}", documentType, loanApplicationId);

            boolean mandatory = isMandatory(application.getPurposeOfLoan(), documentType);

            return PropertyLoanDocumentItemResponse.builder()
                    .documentType(documentType)
                    .displayName(documentType.getDisplayName())
                    .description(documentType.getDescription())
                    .mandatory(mandatory)
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
    public List<PropertyLoanDocumentItemResponse> uploadDocuments(String loanApplicationId, java.util.Map<String, MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one document file is required");
        }

        PropertyLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED) {
            throw new IllegalStateException("Submitted applications cannot be modified");
        }

        PropertyLoanDocument document = documentRepository
                .findByLoanApplication_Id(loanApplicationId)
                .orElseGet(() -> PropertyLoanDocument.builder()
                        .documentId("DOC-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .loanApplication(application)
                        .build());

        boolean anyUploaded = false;
        for (java.util.Map.Entry<String, MultipartFile> entry : files.entrySet()) {
            String key = entry.getKey();
            MultipartFile file = entry.getValue();

            if (file == null || file.isEmpty() || "file".equalsIgnoreCase(key) || "documentType".equalsIgnoreCase(key)) {
                continue;
            }

            PropertyDocumentType type = resolveDocumentType(key);
            if (type != null) {
                try {
                    setFileContent(document, type, file.getBytes());
                    anyUploaded = true;
                    log.info("Document {} uploaded for property loan {}", type, loanApplicationId);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to read file contents for " + key + ": " + e.getMessage(), e);
                }
            } else {
                log.warn("Unrecognized document type key: {}", key);
            }
        }

        if (!anyUploaded) {
            throw new IllegalArgumentException("No valid document files found to upload");
        }

        documentRepository.save(document);
        return getDocuments(loanApplicationId);
    }

    private PropertyDocumentType resolveDocumentType(String key) {
        if (key == null || key.isBlank()) return null;
        String clean = key.trim();
        for (PropertyDocumentType type : PropertyDocumentType.values()) {
            if (type.name().equalsIgnoreCase(clean)) {
                return type;
            }
            String normalizedKey = clean.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            String normalizedType = type.name().replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
            if (normalizedKey.equals(normalizedType)) {
                return type;
            }
        }
        return null;
    }

    private record DocumentReq(PropertyDocumentType type, boolean mandatory) {}

    private List<DocumentReq> getDocumentRequirementsForPurpose(PropertyLoanPurpose purpose) {
        if (purpose == null) {
            return Arrays.stream(PropertyDocumentType.values())
                    .map(t -> new DocumentReq(t, false))
                    .toList();
        }
        return switch (purpose) {
            case HOME_PURCHASE -> List.of(
                    new DocumentReq(PropertyDocumentType.PROPERTY_SALE_AGREEMENT_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.PROPERTY_QUOTATION_BUILDER_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
            case HOME_CONSTRUCTION -> List.of(
                    new DocumentReq(PropertyDocumentType.PROPERTY_OWNERSHIP_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.CONSTRUCTION_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.SANCTIONED_BUILDING_PLAN, true),
                    new DocumentReq(PropertyDocumentType.CONSTRUCTION_COST_ESTIMATE, true),
                    new DocumentReq(PropertyDocumentType.CONTRACTOR_QUOTATION, false),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
            case HOME_RENOVATION -> List.of(
                    new DocumentReq(PropertyDocumentType.PROPERTY_OWNERSHIP_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.RENOVATION_COST_ESTIMATE, true),
                    new DocumentReq(PropertyDocumentType.CONTRACTOR_QUOTATION, true),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
            case PLOT_PURCHASE -> List.of(
                    new DocumentReq(PropertyDocumentType.PLOT_PROPERTY_OWNERSHIP_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.SALE_AGREEMENT, true),
                    new DocumentReq(PropertyDocumentType.PLOT_QUOTATION_COST_SHEET, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
            case PLOT_CONSTRUCTION -> List.of(
                    new DocumentReq(PropertyDocumentType.PLOT_PROPERTY_OWNERSHIP_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.SALE_AGREEMENT_ALLOTMENT_LETTER, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.CONSTRUCTION_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.SANCTIONED_BUILDING_PLAN, true),
                    new DocumentReq(PropertyDocumentType.CONSTRUCTION_COST_ESTIMATE, true),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
            case BALANCE_TRANSFER -> List.of(
                    new DocumentReq(PropertyDocumentType.PROPERTY_DOCUMENT_COPY, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.EXISTING_LOAN_STATEMENT_ACCOUNT_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.FORECLOSURE_OUTSTANDING_STATEMENT, true),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
            case OTHER -> List.of(
                    new DocumentReq(PropertyDocumentType.PROPERTY_SALE_AGREEMENT_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.BANK_STATEMENT_INCOME_DOCUMENT, true),
                    new DocumentReq(PropertyDocumentType.ADDITIONAL_PROPERTY_DOCUMENT, false)
            );
        };
    }

    private boolean isMandatory(PropertyLoanPurpose purpose, PropertyDocumentType type) {
        return getDocumentRequirementsForPurpose(purpose).stream()
                .filter(req -> req.type() == type)
                .findFirst()
                .map(DocumentReq::mandatory)
                .orElse(false);
    }

    @Override
    public List<PropertyLoanDocumentItemResponse> getDocuments(String loanApplicationId) {
        PropertyLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        PropertyLoanDocument doc = documentRepository.findByLoanApplication_Id(loanApplicationId).orElse(null);

        List<DocumentReq> reqs = getDocumentRequirementsForPurpose(application.getPurposeOfLoan());

        return reqs.stream()
                .map(req -> {
                    PropertyDocumentType type = req.type();
                    byte[] content = (doc != null) ? getFileContent(doc, type) : null;
                    return PropertyLoanDocumentItemResponse.builder()
                            .documentType(type)
                            .displayName(type.getDisplayName())
                            .description(type.getDescription())
                            .mandatory(req.mandatory())
                            .uploaded(content != null)
                            .fileSize(content != null ? (long) content.length : null)
                            .uploadedAt(doc != null ? doc.getUpdatedAt() : null)
                            .build();
                })
                .toList();
    }

    @Override
    public byte[] downloadDocument(String loanApplicationId, PropertyDocumentType documentType) {
        findApplicationForCurrentCustomer(loanApplicationId);
        PropertyLoanDocument doc = documentRepository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Documents not found for: " + loanApplicationId));

        byte[] content = getFileContent(doc, documentType);
        if (content == null || content.length == 0) {
            throw new ResourceNotFoundException("Document " + documentType + " is not uploaded");
        }
        return content;
    }

    @Override
    @Transactional
    public void deleteDocument(String loanApplicationId, PropertyDocumentType documentType) {
        PropertyLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED) {
            throw new IllegalStateException("Submitted applications cannot have documents deleted");
        }

        documentRepository.findByLoanApplication_Id(loanApplicationId).ifPresent(doc -> {
            setFileContent(doc, documentType, null);
            documentRepository.save(doc);
            log.info("Document {} deleted for application {}", documentType, loanApplicationId);
        });
    }

    public void setFileContent(PropertyLoanDocument document, PropertyDocumentType type, byte[] data) {
        if (document == null || type == null) return;
        switch (type) {
            case PROPERTY_SALE_AGREEMENT_DOCUMENT -> document.setPropertySaleAgreementDocument(data);
            case BANK_STATEMENT_INCOME_DOCUMENT -> document.setBankStatementIncomeDocument(data);
            case PROPERTY_QUOTATION_BUILDER_DOCUMENT -> document.setPropertyQuotationBuilderDocument(data);
            case ADDITIONAL_PROPERTY_DOCUMENT -> document.setAdditionalPropertyDocument(data);
            case PROPERTY_OWNERSHIP_DOCUMENT -> document.setPropertyOwnershipDocument(data);
            case CONSTRUCTION_DOCUMENT -> document.setConstructionDocument(data);
            case SANCTIONED_BUILDING_PLAN -> document.setSanctionedBuildingPlan(data);
            case CONSTRUCTION_COST_ESTIMATE -> document.setConstructionCostEstimate(data);
            case RENOVATION_COST_ESTIMATE -> document.setRenovationCostEstimate(data);
            case CONTRACTOR_QUOTATION -> document.setContractorQuotation(data);
            case PLOT_PROPERTY_OWNERSHIP_DOCUMENT -> document.setPlotPropertyOwnershipDocument(data);
            case SALE_AGREEMENT -> document.setSaleAgreement(data);
            case PLOT_QUOTATION_COST_SHEET -> document.setPlotQuotationCostSheet(data);
            case SALE_AGREEMENT_ALLOTMENT_LETTER -> document.setSaleAgreementAllotmentLetter(data);
            case EXISTING_LOAN_STATEMENT_ACCOUNT_DOCUMENT -> document.setExistingLoanStatementAccountDocument(data);
            case PROPERTY_DOCUMENT_COPY -> document.setPropertyDocumentCopy(data);
            case FORECLOSURE_OUTSTANDING_STATEMENT -> document.setForeclosureOutstandingStatement(data);
        }
    }

    public byte[] getFileContent(PropertyLoanDocument document, PropertyDocumentType type) {
        if (document == null || type == null) return null;
        return switch (type) {
            case PROPERTY_SALE_AGREEMENT_DOCUMENT -> document.getPropertySaleAgreementDocument();
            case BANK_STATEMENT_INCOME_DOCUMENT -> document.getBankStatementIncomeDocument();
            case PROPERTY_QUOTATION_BUILDER_DOCUMENT -> document.getPropertyQuotationBuilderDocument();
            case ADDITIONAL_PROPERTY_DOCUMENT -> document.getAdditionalPropertyDocument();
            case PROPERTY_OWNERSHIP_DOCUMENT -> document.getPropertyOwnershipDocument();
            case CONSTRUCTION_DOCUMENT -> document.getConstructionDocument();
            case SANCTIONED_BUILDING_PLAN -> document.getSanctionedBuildingPlan();
            case CONSTRUCTION_COST_ESTIMATE -> document.getConstructionCostEstimate();
            case RENOVATION_COST_ESTIMATE -> document.getRenovationCostEstimate();
            case CONTRACTOR_QUOTATION -> document.getContractorQuotation();
            case PLOT_PROPERTY_OWNERSHIP_DOCUMENT -> document.getPlotPropertyOwnershipDocument();
            case SALE_AGREEMENT -> document.getSaleAgreement();
            case PLOT_QUOTATION_COST_SHEET -> document.getPlotQuotationCostSheet();
            case SALE_AGREEMENT_ALLOTMENT_LETTER -> document.getSaleAgreementAllotmentLetter();
            case EXISTING_LOAN_STATEMENT_ACCOUNT_DOCUMENT -> document.getExistingLoanStatementAccountDocument();
            case PROPERTY_DOCUMENT_COPY -> document.getPropertyDocumentCopy();
            case FORECLOSURE_OUTSTANDING_STATEMENT -> document.getForeclosureOutstandingStatement();
        };
    }

    private PropertyLoanApplication findApplicationForCurrentCustomer(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        return applicationRepository.findByIdAndCustomer_CustId(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Property loan application not found: " + id));
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtPrincipal principal)
                || !StringUtils.hasText(principal.custId())
                || !authentication.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_CUSTOMER".equals(authority.getAuthority()))) {
            throw new AccessDeniedException("An authenticated customer is required");
        }
        return principal.custId();
    }
}
