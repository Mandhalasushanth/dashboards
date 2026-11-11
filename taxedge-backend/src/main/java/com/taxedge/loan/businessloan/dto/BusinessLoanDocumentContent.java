package com.taxedge.loan.businessloan.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BusinessLoanDocumentContent {
    byte[] content;
    String fileName;
    String contentType;
}
