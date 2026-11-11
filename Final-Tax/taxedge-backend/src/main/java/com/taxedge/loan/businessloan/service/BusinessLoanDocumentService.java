package com.taxedge.loan.businessloan.service;

import com.taxedge.loan.businessloan.dto.BusinessLoanDocumentDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanDocumentContent;
import org.springframework.web.multipart.MultipartFile;

public interface BusinessLoanDocumentService {

    String saveDocuments(BusinessLoanDocumentDto dto);

    String updateDocuments(String loanApplicationId, BusinessLoanDocumentDto dto);

    BusinessLoanDocumentDto getDocuments(String loanApplicationId);

    void deleteDocuments(String loanApplicationId);

    void uploadDraftDocument(String loanApplicationId, String documentId, MultipartFile file);

    void removeDraftDocument(String loanApplicationId, String documentId);

    BusinessLoanDocumentContent getDraftDocument(String loanApplicationId, String documentId);
}
