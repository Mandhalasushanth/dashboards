package com.taxedge.loan.personalloan.service;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.personalloan.dto.PersonalLoanDocumentDto;

public interface PersonalLoanDocumentService {

    String saveDocuments(String loanApplicationId,
                         MultipartFile panCardFile,
                         MultipartFile aadhaarCardFile,
                         MultipartFile addressProofFile,
                         MultipartFile photographFile,
                         MultipartFile bankStatementsFile,
                         MultipartFile salarySlipsFile,
                         MultipartFile itrAcknowledgmentFile);

    String updateDocuments(String loanApplicationId,
                           MultipartFile panCardFile,
                           MultipartFile aadhaarCardFile,
                           MultipartFile addressProofFile,
                           MultipartFile photographFile,
                           MultipartFile bankStatementsFile,
                           MultipartFile salarySlipsFile,
                           MultipartFile itrAcknowledgmentFile);

    PersonalLoanDocumentDto getDocuments(String loanApplicationId);

    byte[] downloadFile(String loanApplicationId, String fileType);

    void deleteDocument(String loanApplicationId, String fileType);

    void deleteAllDocuments(String loanApplicationId);
}
