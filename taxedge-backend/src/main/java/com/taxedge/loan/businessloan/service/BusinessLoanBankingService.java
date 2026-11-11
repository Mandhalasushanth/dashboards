package com.taxedge.loan.businessloan.service;

import com.taxedge.loan.businessloan.dto.BusinessLoanBankingDto;

public interface BusinessLoanBankingService {

    String saveBanking(BusinessLoanBankingDto dto);

    String updateBanking(String loanApplicationId, BusinessLoanBankingDto dto);

    BusinessLoanBankingDto getBanking(String loanApplicationId);
}
