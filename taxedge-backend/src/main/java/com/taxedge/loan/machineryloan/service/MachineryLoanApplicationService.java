package com.taxedge.loan.machineryloan.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.machineryloan.dto.MachineryLoanApplicationDto;

public interface MachineryLoanApplicationService {

    String saveApplication(MachineryLoanApplicationDto dto);

    MachineryLoanApplicationDto submitApplication(
            MachineryLoanApplicationDto dto,
            MultipartFile machineryQuotationFile);

    String updateApplication(String machineryLoanId, MachineryLoanApplicationDto dto);

    MachineryLoanApplicationDto getApplication(String machineryLoanId);

    List<MachineryLoanApplicationDto> getApplications();

    void deleteApplication(String machineryLoanId);
}
