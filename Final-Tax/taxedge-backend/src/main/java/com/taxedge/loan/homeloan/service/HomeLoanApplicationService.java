package com.taxedge.loan.homeloan.service;

import com.taxedge.loan.homeloan.dto.HomeLoanApplicationKycDto;

public interface HomeLoanApplicationService {

    HomeLoanApplicationKycDto getCustomerKycDetails(String customerId);
}
