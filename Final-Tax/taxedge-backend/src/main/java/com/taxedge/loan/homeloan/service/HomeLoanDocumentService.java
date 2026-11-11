
package com.taxedge.loan.homeloan.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.homeloan.dto.HomeLoanDocumentRequestDto;
import com.taxedge.loan.homeloan.dto.HomeLoanDocumentResponseDto;
import com.taxedge.loan.homeloan.enums.HomeLoanRequirementPurpose;
import com.taxedge.loan.homeloan.requirement.HomeLoanDocumentRequirementDto;

public interface HomeLoanDocumentService {

    List<HomeLoanDocumentRequirementDto> getDocumentRequirements(
            HomeLoanRequirementPurpose loanPurpose);

    HomeLoanDocumentResponseDto uploadDocuments(
            String homeLoanId,
            HomeLoanDocumentRequestDto dto) throws IOException;

    HomeLoanDocumentResponseDto getDocuments(String homeLoanId);

    byte[] viewDocument(String homeLoanId, String documentType);

    HomeLoanDocumentResponseDto replaceDocuments(
            String homeLoanId,
            Map<String, MultipartFile> files
    ) throws IOException;

    HomeLoanDocumentResponseDto removeDocument(
            String homeLoanId,
            String documentType);
}
