package com.taxedge.loan.businessloan.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BusinessLoanDraftDto {
    BusinessLoanApplicationDto application;
    BusinessLoanProfileDto businessProfile;
    List<BusinessLoanDraftDocumentDto> documents;
}
