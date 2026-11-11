package com.taxedge.loan.msmeloan.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.msmeloan.dto.MsmeLoanApplicationDto;
import com.taxedge.loan.msmeloan.dto.MsmeLoanSubmissionRequestDto;

public interface MsmeLoanApplicationService {

    MsmeLoanApplicationDto saveApplication(MsmeLoanApplicationDto dto);

    MsmeLoanApplicationDto submitApplication(
            MsmeLoanSubmissionRequestDto request,
            MultipartFile udyamCertificate,
            MultipartFile gstCertificate);

    MsmeLoanApplicationDto updateApplication(String id, MsmeLoanApplicationDto dto);

    MsmeLoanApplicationDto getApplication(String id);

    List<MsmeLoanApplicationDto> getMyApplications();

    void deleteApplication(String id);
}
