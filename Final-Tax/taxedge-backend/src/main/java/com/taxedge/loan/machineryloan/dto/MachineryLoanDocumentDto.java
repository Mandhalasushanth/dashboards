package com.taxedge.loan.machineryloan.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(onlyExplicitlyIncluded = true)
public class MachineryLoanDocumentDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    // banking
    private byte[] bankStatementFile;

    // business & tax
    private byte[] machineryQuotationFile;
    private byte[] gstCertificateFile;
    private byte[] businessRegistrationProofFile;
    private byte[] udyamCertificateFile;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;
}
