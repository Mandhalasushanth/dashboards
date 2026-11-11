package com.taxedge.companyregistration.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentsKycChecklistDto {

    private String documentId;

    private String companyRegistrationId;

    private MultipartFile panCard;

    private MultipartFile identityAddressProof;

    private MultipartFile passportPhoto;

    private MultipartFile officeAddressProof;

    private MultipartFile officeUtilityBill;

    private MultipartFile ownerNoc;

    private MultipartFile statutoryDocuments;

    private MultipartFile aoaEAoa;
}