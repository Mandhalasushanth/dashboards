package com.taxedge.loan.propertyloan.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.propertyloan.dto.PropertyLoanDocumentItemResponse;
import com.taxedge.loan.propertyloan.enums.PropertyDocumentType;

public interface PropertyLoanDocumentService {

    PropertyLoanDocumentItemResponse uploadDocument(String loanApplicationId, PropertyDocumentType documentType, MultipartFile file);

    List<PropertyLoanDocumentItemResponse> uploadDocuments(String loanApplicationId, Map<String, MultipartFile> files);

    List<PropertyLoanDocumentItemResponse> getDocuments(String loanApplicationId);

    byte[] downloadDocument(String loanApplicationId, PropertyDocumentType documentType);

    void deleteDocument(String loanApplicationId, PropertyDocumentType documentType);
}
