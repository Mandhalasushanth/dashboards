package com.taxedge.myapplications.gst.gstregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.gst.registration.entity.Business;
import com.taxedge.myapplications.gst.gstregistration.dto.MyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface MyApplicationsMapper {

    @Mapping(target = "applicationType", constant = "GST_REGISTRATION")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "documentId", source = "documents.documentId")
    @Mapping(target = "principalPlaceAddressType", source = "documents.principalPlaceAddressType")
    @Mapping(target = "panCardUploaded", expression = "java(business.getDocuments() != null && business.getDocuments().getPanCard() != null && business.getDocuments().getPanCard().length > 0)")
    @Mapping(target = "aadhaarCardUploaded", expression = "java(business.getDocuments() != null && business.getDocuments().getAadhaarCard() != null && business.getDocuments().getAadhaarCard().length > 0)")
    @Mapping(target = "businessRegistrationProofUploaded", expression = "java(business.getDocuments() != null && business.getDocuments().getBusinessRegistrationProof() != null && business.getDocuments().getBusinessRegistrationProof().length > 0)")
    @Mapping(target = "principalPlaceAddressProofUploaded", expression = "java(business.getDocuments() != null && business.getDocuments().getPrincipalPlaceAddressProof() != null && business.getDocuments().getPrincipalPlaceAddressProof().length > 0)")
    @Mapping(target = "bankPassbookOrCancelledChequeUploaded", expression = "java(business.getDocuments() != null && business.getDocuments().getBankPassbookOrCancelledCheque() != null && business.getDocuments().getBankPassbookOrCancelledCheque().length > 0)")
    @Mapping(target = "passportSizePhotographUploaded", expression = "java(business.getDocuments() != null && business.getDocuments().getPassportSizePhotograph() != null && business.getDocuments().getPassportSizePhotograph().length > 0)")
    MyApplicationResponseDto toDto(Business business);
}
