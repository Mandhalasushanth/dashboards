package com.taxedge.loan.personalloan.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.personalloan.dto.PersonalLoanApplicationDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PersonalLoanSubmissionService {

    private final PersonalLoanApplicationService applicationService;
    private final PersonalLoanDocumentService documentService;

    @Transactional
    public PersonalLoanApplicationDto submit(
            PersonalLoanApplicationDto application,
            MultipartFile panCardFile,
            MultipartFile bankStatementsFile,
            MultipartFile itrAcknowledgmentFile) {
        PersonalLoanApplicationDto saved = applicationService.saveApplication(application);
        documentService.saveDocuments(
                saved.getId(),
                panCardFile,
                null,
                null,
                null,
                bankStatementsFile,
                null,
                itrAcknowledgmentFile);
        return saved;
    }
}
