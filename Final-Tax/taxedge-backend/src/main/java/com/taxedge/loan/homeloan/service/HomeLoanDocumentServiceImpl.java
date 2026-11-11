package com.taxedge.loan.homeloan.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.taxedge.loan.homeloan.dto.HomeLoanDocumentRequestDto;
import com.taxedge.loan.homeloan.dto.HomeLoanDocumentResponseDto;
import com.taxedge.loan.homeloan.entity.HomeLoanDocument;
import com.taxedge.loan.homeloan.entity.HomeLoanRequirementApplication;
import com.taxedge.loan.homeloan.enums.HomeLoanRequirementPurpose;
import com.taxedge.loan.homeloan.repository.HomeLoanDocumentRepository;
import com.taxedge.loan.homeloan.repository.HomeLoanRequirementApplicationRepository;
import com.taxedge.loan.homeloan.requirement.HomeLoanDocumentRequirementDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class HomeLoanDocumentServiceImpl implements HomeLoanDocumentService {

    private final HomeLoanDocumentRepository documentRepository;
    private final HomeLoanRequirementApplicationRepository applicationRepository;

    private record DocumentDef(String type, String name, String description, boolean required) {}

    private static final List<DocumentDef> ALL_DEFINITIONS = List.of(
            new DocumentDef("propertyOwnershipDocument", "Property Ownership Document", "Property ownership document file", true),
            new DocumentDef("bankStatementIncomeDocument", "Bank Statement / Income Document", "Bank statement / income proof", true),
            new DocumentDef("propertyQuotationBuilderDocument", "Property Quotation / Builder Document", "Quotation from builder", false),
            new DocumentDef("additionalPropertyDocument", "Additional Property Document", "Additional property doc (optional)", false),
            new DocumentDef("constructionDocument", "Construction Document", "Construction doc (optional)", false),
            new DocumentDef("sanctionedBuildingPlan", "Sanctioned Building Plan", "Sanctioned plan (optional)", false),
            new DocumentDef("constructionCostEstimate", "Construction Cost Estimate", "Construction cost estimate (optional)", false),
            new DocumentDef("renovationCostEstimate", "Renovation Cost Estimate", "Renovation estimate (optional)", false),
            new DocumentDef("contractorQuotation", "Contractor Quotation", "Contractor quotation (optional)", false),
            new DocumentDef("existingLoanStatement", "Existing Loan Statement", "Statement of existing loan (optional)", false),
            new DocumentDef("propertyDocumentCopy", "Property Document Copy", "Copy of property doc (optional)", false),
            new DocumentDef("foreclosureOutstandingStatement", "Foreclosure Outstanding Statement", "Foreclosure statement (optional)", false)
    );

    private List<DocumentDef> getDefinitionsForPurpose(HomeLoanRequirementPurpose purpose) {
        if (purpose == null) {
            return ALL_DEFINITIONS;
        }
        return switch (purpose) {
            case PURCHASE_NEW_HOME -> List.of(
                    new DocumentDef("propertyOwnershipDocument", "Property Ownership Document", "Property ownership document file", true),
                    new DocumentDef("bankStatementIncomeDocument", "Bank Statement / Income Document", "Bank statement / income proof", true),
                    new DocumentDef("propertyQuotationBuilderDocument", "Property Quotation / Builder Document", "Quotation from builder", true),
                    new DocumentDef("additionalPropertyDocument", "Additional Property Document", "Additional property doc (optional)", false)
            );
            case PURCHASE_RESALE_HOME -> List.of(
                    new DocumentDef("propertyOwnershipDocument", "Property Ownership Document", "Property ownership document file", true),
                    new DocumentDef("bankStatementIncomeDocument", "Bank Statement / Income Document", "Bank statement / income proof", true),
                    new DocumentDef("propertyDocumentCopy", "Property Document Copy", "Copy of property doc (optional)", true),
                    new DocumentDef("additionalPropertyDocument", "Additional Property Document", "Additional property doc (optional)", false)
            );
            case CONSTRUCT_HOUSE -> List.of(
                    new DocumentDef("propertyOwnershipDocument", "Property Ownership Document", "Property ownership document file", true),
                    new DocumentDef("bankStatementIncomeDocument", "Bank Statement / Income Document", "Bank statement / income proof", true),
                    new DocumentDef("constructionDocument", "Construction Document", "Construction doc (optional)", true),
                    new DocumentDef("sanctionedBuildingPlan", "Sanctioned Building Plan", "Sanctioned plan (optional)", true),
                    new DocumentDef("constructionCostEstimate", "Construction Cost Estimate", "Construction cost estimate (optional)", true),
                    new DocumentDef("contractorQuotation", "Contractor Quotation", "Contractor quotation (optional)", false),
                    new DocumentDef("additionalPropertyDocument", "Additional Property Document", "Additional property doc (optional)", false)
            );
            case HOME_RENOVATION -> List.of(
                    new DocumentDef("propertyOwnershipDocument", "Property Ownership Document", "Property ownership document file", true),
                    new DocumentDef("bankStatementIncomeDocument", "Bank Statement / Income Document", "Bank statement / income proof", true),
                    new DocumentDef("renovationCostEstimate", "Renovation Cost Estimate", "Renovation estimate (optional)", true),
                    new DocumentDef("contractorQuotation", "Contractor Quotation", "Contractor quotation (optional)", true),
                    new DocumentDef("additionalPropertyDocument", "Additional Property Document", "Additional property doc (optional)", false)
            );
            case BALANCE_TRANSFER -> List.of(
                    new DocumentDef("propertyOwnershipDocument", "Property Ownership Document", "Property ownership document file", true),
                    new DocumentDef("bankStatementIncomeDocument", "Bank Statement / Income Document", "Bank statement / income proof", true),
                    new DocumentDef("existingLoanStatement", "Existing Loan Statement", "Statement of existing loan (optional)", true),
                    new DocumentDef("foreclosureOutstandingStatement", "Foreclosure Outstanding Statement", "Foreclosure statement (optional)", true),
                    new DocumentDef("propertyDocumentCopy", "Property Document Copy", "Copy of property doc (optional)", false),
                    new DocumentDef("additionalPropertyDocument", "Additional Property Document", "Additional property doc (optional)", false)
            );
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<HomeLoanDocumentRequirementDto> getDocumentRequirements(HomeLoanRequirementPurpose loanPurpose) {
        return getDefinitionsForPurpose(loanPurpose).stream()
                .map(def -> HomeLoanDocumentRequirementDto.builder()
                        .documentType(def.type())
                        .documentName(def.name())
                        .description(def.description())
                        .required(def.required())
                        .uploaded(false)
                        .build())
                .toList();
    }

    @Override
    public HomeLoanDocumentResponseDto uploadDocuments(String homeLoanId, HomeLoanDocumentRequestDto dto) throws IOException {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document request is required");
        }
        return replaceDocuments(homeLoanId, dto.toMap());
    }

    @Override
    @Transactional(readOnly = true)
    public HomeLoanDocumentResponseDto getDocuments(String homeLoanId) {
        getApplication(homeLoanId);
        HomeLoanDocument document = documentRepository.findByHomeLoanApplication_HomeLoanId(homeLoanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No documents found"));
        return toResponse(document);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] viewDocument(String homeLoanId, String documentType) {
        HomeLoanDocument document = getDocument(homeLoanId);
        byte[] content = document.getContent(documentType);
        if (content == null || content.length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document has not been uploaded");
        }
        return content;
    }

    @Override
    public HomeLoanDocumentResponseDto replaceDocuments(String homeLoanId, Map<String, MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one document must be provided");
        }

        HomeLoanRequirementApplication application = getApplication(homeLoanId);
        ensureDraft(application);

        HomeLoanDocument document = documentRepository.findByHomeLoanApplication_HomeLoanId(homeLoanId)
                .orElseGet(() -> HomeLoanDocument.builder()
                        .documentId("DOC" + UUID.randomUUID().toString().replace("-", ""))
                        .homeLoanApplication(application)
                        .build());

        for (Map.Entry<String, MultipartFile> entry : files.entrySet()) {
            MultipartFile file = entry.getValue();
            if (file != null && !file.isEmpty()) {
                document.setContent(entry.getKey(), file.getBytes());
            }
        }

        return toResponse(documentRepository.save(document));
    }

    @Override
    public HomeLoanDocumentResponseDto removeDocument(String homeLoanId, String documentType) {
        HomeLoanRequirementApplication application = getApplication(homeLoanId);
        ensureDraft(application);

        HomeLoanDocument document = getDocument(homeLoanId);
        document.setContent(documentType, null);

        return toResponse(documentRepository.save(document));
    }

    private HomeLoanRequirementApplication getApplication(String homeLoanId) {
        return applicationRepository.findById(homeLoanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Home loan application not found: " + homeLoanId));
    }

    private HomeLoanDocument getDocument(String homeLoanId) {
        return documentRepository.findByHomeLoanApplication_HomeLoanId(homeLoanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No documents found for home loan: " + homeLoanId));
    }

    private void ensureDraft(HomeLoanRequirementApplication application) {
        if (!"DRAFT".equalsIgnoreCase(application.getApplicationStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Documents can only be changed while the application is in DRAFT status");
        }
    }

    private HomeLoanDocumentResponseDto toResponse(HomeLoanDocument document) {
        HomeLoanRequirementApplication app = document.getHomeLoanApplication();
        HomeLoanRequirementPurpose purpose = app != null ? app.getLoanPurpose() : null;

        List<HomeLoanDocumentRequirementDto> requirements = new ArrayList<>();
        for (DocumentDef def : getDefinitionsForPurpose(purpose)) {
            byte[] content = document.getContent(def.type());
            requirements.add(HomeLoanDocumentRequirementDto.builder()
                    .documentType(def.type())
                    .documentName(def.name())
                    .description(def.description())
                    .required(def.required())
                    .uploaded(content != null && content.length > 0)
                    .build());
        }

        return HomeLoanDocumentResponseDto.builder()
                .documentId(document.getDocumentId())
                .homeLoanId(app != null ? app.getHomeLoanId() : null)
                .documents(requirements)
                .build();
    }
}
