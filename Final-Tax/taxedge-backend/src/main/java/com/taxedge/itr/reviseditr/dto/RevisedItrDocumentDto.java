package com.taxedge.itr.reviseditr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrDocumentDto {

    private String revisedItrId;

    private byte[] panCard;

    private byte[] aadhaarCard;

    private byte[] form16Form16A;

    private byte[] aisTisStatement;

    private byte[] bankStatements;

    private byte[] investmentProofs;
}
