package com.taxedge.loan.msmeloan.dto;

import java.time.LocalDateTime;

import com.taxedge.loan.msmeloan.enums.MsmeDocumentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MsmeLoanDocumentItemResponse {
    private MsmeDocumentType documentType;
    private String displayName;
    private boolean uploaded;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
