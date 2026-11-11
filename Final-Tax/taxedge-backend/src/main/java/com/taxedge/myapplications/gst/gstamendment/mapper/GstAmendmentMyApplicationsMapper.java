package com.taxedge.myapplications.gst.gstamendment.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;
import com.taxedge.myapplications.gst.gstamendment.dto.GstAmendmentMyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface GstAmendmentMyApplicationsMapper {

    @Mapping(target = "amendmentId", source = "id")
    @Mapping(target = "section", constant = "LEGAL_NAME")
    @Mapping(target = "applicationType", constant = "GST_AMENDMENT")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "description", constant = "Legal Name Amendment")
    @Mapping(target = "amendedValue", source = "newLegalName")
    @Mapping(target = "proofDocumentUploaded", expression = "java(e.getImageData() != null && e.getImageData().length > 0)")
    GstAmendmentMyApplicationResponseDto toDto(LegalNameAmendmentEntity e);

    @Mapping(target = "amendmentId", source = "id")
    @Mapping(target = "section", constant = "PRINCIPAL_PLACE")
    @Mapping(target = "applicationType", constant = "GST_AMENDMENT")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "description", constant = "Principal Place Amendment")
    @Mapping(target = "amendedValue", source = "newBusinessAddress")
    @Mapping(target = "proofDocumentUploaded", expression = "java(e.getImageData() != null && e.getImageData().length > 0)")
    GstAmendmentMyApplicationResponseDto toDto(PrincipalPlaceAmendmentEntity e);

    @Mapping(target = "amendmentId", source = "id")
    @Mapping(target = "section", constant = "ADDITIONAL_PLACE")
    @Mapping(target = "applicationType", constant = "GST_AMENDMENT")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "description", constant = "Additional Place Amendment")
    @Mapping(target = "amendedValue", source = "address")
    @Mapping(target = "proofDocumentUploaded", expression = "java(e.getImageData() != null && e.getImageData().length > 0)")
    GstAmendmentMyApplicationResponseDto toDto(AdditionalPlaceAmendmentEntity e);

    @Mapping(target = "amendmentId", source = "id")
    @Mapping(target = "section", constant = "BANK_ACCOUNT")
    @Mapping(target = "applicationType", constant = "GST_AMENDMENT")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "description", constant = "Bank Account Amendment")
    @Mapping(target = "amendedValue", source = "newBankAccountNumber")
    @Mapping(target = "proofDocumentUploaded", expression = "java(e.getImageData() != null && e.getImageData().length > 0)")
    GstAmendmentMyApplicationResponseDto toDto(BankAccountAmendmentEntity e);

    @Mapping(target = "amendmentId", source = "id")
    @Mapping(target = "section", constant = "SIGNATORY")
    @Mapping(target = "applicationType", constant = "GST_AMENDMENT")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "description", constant = "Signatory Amendment")
    @Mapping(target = "amendedValue", source = "newSignatoryName")
    @Mapping(target = "proofDocumentUploaded", expression = "java(e.getImageData() != null && e.getImageData().length > 0)")
    GstAmendmentMyApplicationResponseDto toDto(SignatoryAmendmentEntity e);

    @Mapping(target = "amendmentId", source = "id")
    @Mapping(target = "section", constant = "CONTACT")
    @Mapping(target = "applicationType", constant = "GST_AMENDMENT")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "description", constant = "Contact Amendment")
    @Mapping(target = "amendedValue", source = "newEmail")
    @Mapping(target = "proofDocumentUploaded", expression = "java(e.getImageData() != null && e.getImageData().length > 0)")
    GstAmendmentMyApplicationResponseDto toDto(ContactAmendmentEntity e);
}
