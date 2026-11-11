package com.taxedge.loan.personalloan.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalLoanDocumentDto {

    private Long id;

    private String loanApplicationId;

    @JsonIgnore
    private byte[] panCardFile;

    @JsonIgnore
    private byte[] aadhaarCardFile;

    @JsonIgnore
    private byte[] addressProofFile;

    @JsonIgnore
    private byte[] photographFile;

    @JsonIgnore
    private byte[] bankStatementsFile;

    @JsonIgnore
    private byte[] salarySlipsFile;

    @JsonIgnore
    private byte[] itrAcknowledgmentFile;

    private String panCardFileName;

    private String panCardFileContentType;

    private Long panCardFileSize;

    private String aadhaarCardFileName;

    private String aadhaarCardFileContentType;

    private Long aadhaarCardFileSize;

    private String addressProofFileName;

    private String addressProofFileContentType;

    private Long addressProofFileSize;

    private String photographFileName;

    private String photographFileContentType;

    private Long photographFileSize;

    private String bankStatementsFileName;

    private String bankStatementsFileContentType;

    private Long bankStatementsFileSize;

    private String salarySlipsFileName;

    private String salarySlipsFileContentType;

    private Long salarySlipsFileSize;

    private String itrAcknowledgmentFileName;

    private String itrAcknowledgmentFileContentType;

    private Long itrAcknowledgmentFileSize;

    private LocalDateTime createdAt;
}
