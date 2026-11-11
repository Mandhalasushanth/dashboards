package com.taxedge.loan.personalloan.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.personalloan.dto.PersonalLoanDocumentDto;
import com.taxedge.loan.personalloan.entity.PersonalLoanApplication;
import com.taxedge.loan.personalloan.entity.PersonalLoanDocument;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.personalloan.mapper.PersonalLoanDocumentMapper;
import com.taxedge.loan.personalloan.repository.PersonalLoanApplicationRepository;
import com.taxedge.loan.personalloan.repository.PersonalLoanDocumentRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalLoanDocumentServiceImpl implements PersonalLoanDocumentService {

    private final PersonalLoanDocumentRepository repository;
    private final PersonalLoanApplicationRepository applicationRepository;
    private final PersonalLoanDocumentMapper mapper;

    @Override
    @Transactional
    public String saveDocuments(String loanApplicationId,
                                MultipartFile panCardFile,
                                MultipartFile aadhaarCardFile,
                                MultipartFile addressProofFile,
                                MultipartFile photographFile,
                                MultipartFile bankStatementsFile,
                                MultipartFile salarySlipsFile,
                                MultipartFile itrAcknowledgmentFile) {
        PersonalLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        assertApplicationEditable(application);

        PersonalLoanDocument entity = repository.findByLoanApplication_Id(loanApplicationId)
                .orElseGet(() -> PersonalLoanDocument.builder()
                        .loanApplication(application)
                        .build());

        Map<String, MultipartFile> allFiles = new java.util.HashMap<>();
        addIfValid(allFiles, "pancardfile", panCardFile);
        addIfValid(allFiles, "aadhaarcard", aadhaarCardFile);
        addIfValid(allFiles, "addressproof", addressProofFile);
        addIfValid(allFiles, "photograph", photographFile);
        addIfValid(allFiles, "bankstatements", bankStatementsFile);
        addIfValid(allFiles, "salaryslips", salarySlipsFile);
        addIfValid(allFiles, "itracknowledgment", itrAcknowledgmentFile);

        allFiles.forEach((type, file) -> {
            try {
                entity.setFileContent(type, file.getBytes());
                entity.setFileMetadata(
                        type,
                        file.getOriginalFilename(),
                        file.getContentType(),
                        file.getSize());
            } catch (IOException e) {
                throw new RuntimeException("Failed to read file: " + type, e);
            }
        });

        repository.save(entity);
        log.info("Documents saved for personal loan application {}", loanApplicationId);
        return loanApplicationId;
    }

    @Override
    @Transactional
    public String updateDocuments(String loanApplicationId,
                                  MultipartFile panCardFile,
                                  MultipartFile aadhaarCardFile,
                                  MultipartFile addressProofFile,
                                  MultipartFile photographFile,
                                  MultipartFile bankStatementsFile,
                                  MultipartFile salarySlipsFile,
                                  MultipartFile itrAcknowledgmentFile) {
        return saveDocuments(loanApplicationId, panCardFile, aadhaarCardFile, addressProofFile,
                photographFile, bankStatementsFile, salarySlipsFile, itrAcknowledgmentFile);
    }

    @Override
    public PersonalLoanDocumentDto getDocuments(String loanApplicationId) {
        return mapper.toDto(findOrThrow(loanApplicationId));
    }

    @Override
    public byte[] downloadFile(String loanApplicationId, String fileType) {
        PersonalLoanDocument entity = findOrThrow(loanApplicationId);
        byte[] file = entity.getFileContent(fileType);

        if (file == null || file.length == 0) {
            throw new ResourceNotFoundException("File " + fileType + " not found for application: " + loanApplicationId);
        }
        return file;
    }

    @Override
    @Transactional
    public void deleteDocument(String loanApplicationId, String fileType) {
        PersonalLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        assertApplicationEditable(application);

        PersonalLoanDocument entity = findOrThrow(loanApplicationId);
        entity.setFileContent(fileType, null);
        entity.clearFileMetadata(fileType);
        repository.save(entity);
        log.info("Deleted document {} for personal loan application {}", fileType, loanApplicationId);
    }

    @Override
    @Transactional
    public void deleteAllDocuments(String loanApplicationId) {
        PersonalLoanApplication application = findApplicationForCurrentCustomer(loanApplicationId);
        assertApplicationEditable(application);

        repository.deleteByLoanApplication_Id(loanApplicationId);
        log.info("Deleted all documents for personal loan application {}", loanApplicationId);
    }

    private PersonalLoanDocument findOrThrow(String loanApplicationId) {
        findApplicationForCurrentCustomer(loanApplicationId);
        return repository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Documents not found for personal loan application: " + loanApplicationId));
    }

    private PersonalLoanApplication findApplicationForCurrentCustomer(String loanApplicationId) {
        return applicationRepository
                .findByIdAndCustomer_CustId(loanApplicationId, currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan application not found: " + loanApplicationId));
    }

    private void assertApplicationEditable(PersonalLoanApplication application) {
        if (application.getStatus() == LoanApplicationStatus.SUBMITTED || application.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted or approved personal loan applications cannot be modified");
        }
    }

    private void addIfValid(Map<String, MultipartFile> map, String key, MultipartFile file) {
        if (file != null && !file.isEmpty()) {
            map.put(key, file);
        }
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtPrincipal principal)
                || !StringUtils.hasText(principal.custId())
                || !authentication.getAuthorities().stream().anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()))) {
            throw new AccessDeniedException("An authenticated customer is required");
        }
        return principal.custId();
    }
}
