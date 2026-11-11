package com.taxedge.loan.msmeloan.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.msmeloan.dto.MsmeLoanDocumentItemResponse;
import com.taxedge.loan.msmeloan.enums.MsmeDocumentType;

public interface MsmeLoanDocumentService {

    MsmeLoanDocumentItemResponse uploadDocument(String loanApplicationId, MsmeDocumentType documentType, MultipartFile file);

    List<MsmeLoanDocumentItemResponse> uploadDocuments(String loanApplicationId, Map<String, MultipartFile> files);

    List<MsmeLoanDocumentItemResponse> getDocuments(String loanApplicationId);

    byte[] downloadDocument(String loanApplicationId, MsmeDocumentType documentType);

    void deleteDocument(String loanApplicationId, MsmeDocumentType documentType);

    void deleteAllDocuments(String loanApplicationId);
}
