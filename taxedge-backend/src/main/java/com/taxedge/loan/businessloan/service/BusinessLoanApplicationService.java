package com.taxedge.loan.businessloan.service;

import java.util.Optional;

import com.taxedge.loan.businessloan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanDraftDto;

public interface BusinessLoanApplicationService {

    String saveApplication(BusinessLoanApplicationDto dto);

    String updateApplication(String id, BusinessLoanApplicationDto dto);

    BusinessLoanApplicationDto getApplication(String id);

    Optional<BusinessLoanDraftDto> getCurrentDraft();

    String submitDraft(String id);

    void deleteApplication(String id);
}
