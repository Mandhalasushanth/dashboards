package com.taxedge.loan.businessloan.service;

import com.taxedge.loan.businessloan.dto.BusinessLoanProfileDto;

public interface BusinessLoanProfileService {

    String saveProfile(BusinessLoanProfileDto dto);

    String updateProfile(String loanApplicationId, BusinessLoanProfileDto dto);

    BusinessLoanProfileDto getProfile(String loanApplicationId);
}
