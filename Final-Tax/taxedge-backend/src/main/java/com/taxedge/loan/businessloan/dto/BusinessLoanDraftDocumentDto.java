package com.taxedge.loan.businessloan.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BusinessLoanDraftDocumentDto {
    String documentId;
    String fileName;
    String contentType;
    long fileSize;
}
