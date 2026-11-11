package com.taxedge.loan.propertyloan.dto;

import java.time.LocalDateTime;

import com.taxedge.loan.propertyloan.enums.PropertyDocumentType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyLoanDocumentItemResponse {

    private PropertyDocumentType documentType;
    private String displayName;
    private String description;
    private boolean mandatory;
    private boolean uploaded;
    private String fileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
