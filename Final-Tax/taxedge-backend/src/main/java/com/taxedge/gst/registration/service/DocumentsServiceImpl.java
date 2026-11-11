package com.taxedge.gst.registration.service;

import java.io.IOException;
import java.util.UUID;

import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.registration.dto.DocumentsDto;
import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.entity.Documents;
import com.taxedge.gst.registration.enums.DocumentsType;
import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.registration.mapper.DocumentsMapper;
import com.taxedge.gst.registration.repository.BusinessRepository;
import com.taxedge.gst.registration.repository.DocumentsRepository;
import com.taxedge.validator.GstFileUploadValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentsServiceImpl implements DocumentsService {

    private final DocumentsRepository documentsRepository;

    private final BusinessRepository businessRepository;

    private final DocumentsMapper documentsMapper;

    private final GstFileUploadValidator fileUploadValidator;
    
    

    @Override
    public String uploadFile(String gstId, MultipartFile panCard, MultipartFile aadhaarCard,
            MultipartFile businessRegistrationProof, PrincipalPlaceAddressType principalPlaceAddressType,
            MultipartFile principalPlaceAddressProof, MultipartFile bankPassbookOrCancelledCheque,
            MultipartFile passportSizePhotograph) throws IOException {

        Business business = businessRepository.findById(gstId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Business not found with GST ID: " + gstId));

        validateAtLeastOneDocument(
                panCard,
                aadhaarCard,
                businessRegistrationProof,
                principalPlaceAddressProof,
                bankPassbookOrCancelledCheque,
                passportSizePhotograph);

        if (principalPlaceAddressProof != null
                && !principalPlaceAddressProof.isEmpty()
                && principalPlaceAddressType == null) {

            throw new BadRequestException("Principal place address type is required");
        }

        if (documentsRepository.findByBusiness_GstId(gstId).isPresent()) {
            throw new IllegalArgumentException(
                    "Documents already exist for this GST ID: " + gstId);
        }

        Documents documents = Documents.builder()
                .documentId(generateDocumentId())
                .business(business)
                .panCard(storeFile(panCard, "panCard"))
                .aadhaarCard(storeFile(aadhaarCard, "aadhaarCard"))
                .businessRegistrationProof(
                        storeFile(businessRegistrationProof, "businessRegistrationProof"))
                .principalPlaceAddressType(principalPlaceAddressType)
                .principalPlaceAddressProof(
                        storeFile(principalPlaceAddressProof, "principalPlaceAddressProof"))
                .bankPassbookOrCancelledCheque(
                        storeFile(bankPassbookOrCancelledCheque, "bankPassbookOrCancelledCheque"))
                .passportSizePhotograph(
                        storeFile(passportSizePhotograph, "passportSizePhotograph"))
                .build();

        documentsRepository.save(documents);

        return "Documents uploaded successfully. Document ID: "
                + documents.getDocumentId();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentsDto getDocuments(String documentId) {

        Documents documents = documentsRepository.findById(documentId).or(() -> documentsRepository.findByBusiness_GstId(documentId)).orElseThrow(() -> new ResourceNotFoundException(
                        "Documents not found with ID: " + documentId));

        return documentsMapper.toDto(documents);
    }

    @Override
    public String updateFile(String documentId, MultipartFile panCard, MultipartFile aadhaarCard,
            MultipartFile businessRegistrationProof, PrincipalPlaceAddressType principalPlaceAddressType,
            MultipartFile principalPlaceAddressProof, MultipartFile bankPassbookOrCancelledCheque,
            MultipartFile passportSizePhotograph) throws IOException {

        Documents documents = documentsRepository.findById(documentId).or(() -> documentsRepository.findByBusiness_GstId(documentId)).orElseThrow(() -> new ResourceNotFoundException(
                        "Documents not found with ID: " + documentId));

        validateAtLeastOneDocument(
                panCard,
                aadhaarCard,
                businessRegistrationProof,
                principalPlaceAddressProof,
                bankPassbookOrCancelledCheque,
                passportSizePhotograph);

        if (principalPlaceAddressProof != null
                && !principalPlaceAddressProof.isEmpty()
                && principalPlaceAddressType == null) {

            throw new BadRequestException("Principal place address type is required");
        }

        updateFile(documents, panCard, "panCard");
        updateFile(documents, aadhaarCard, "aadhaarCard");
        updateFile(documents, businessRegistrationProof, "businessRegistrationProof");
        updateFile(documents, principalPlaceAddressProof, "principalPlaceAddressProof");
        updateFile(documents, bankPassbookOrCancelledCheque, "bankPassbookOrCancelledCheque");
        updateFile(documents, passportSizePhotograph, "passportSizePhotograph");

        if (principalPlaceAddressType != null) {
            documents.setPrincipalPlaceAddressType(principalPlaceAddressType);
        }

        documentsRepository.save(documents);

        return "Documents updated successfully. Document ID: "
                + documents.getDocumentId();
    }

    @Override
    public String deleteFile(String documentId) {

        Documents documents = documentsRepository.findById(documentId).or(() -> documentsRepository.findByBusiness_GstId(documentId)).orElseThrow(() -> new ResourceNotFoundException(
                        "Documents not found with ID: " + documentId));

        documentsRepository.delete(documents);

        return "Documents deleted successfully";
    }

    private byte[] storeFile(MultipartFile file, String documentType) throws IOException {

        if (file == null || file.isEmpty()) {
            return null;
        }

        fileUploadValidator.validate(file, documentType);

        return file.getBytes();
    }

    private void updateFile(Documents documents, MultipartFile file, String documentType)
            throws IOException {

        if (file == null || file.isEmpty()) {
            return;
        }

        fileUploadValidator.validate(file, documentType);

        byte[] data = file.getBytes();

        DocumentsType type = DocumentsType.from(documentType);

        switch (type) {
        case PAN_CARD -> documents.setPanCard(data);
        case AADHAAR_CARD -> documents.setAadhaarCard(data);
        case BUSINESS_REGISTRATION_PROOF -> documents.setBusinessRegistrationProof(data);
        case PRINCIPAL_PLACE_ADDRESS_PROOF -> documents.setPrincipalPlaceAddressProof(data);
        case BANK_PASSBOOK_OR_CANCELLED_CHEQUE -> documents.setBankPassbookOrCancelledCheque(data);
        case PASSPORT_SIZE_PHOTOGRAPH -> documents.setPassportSizePhotograph(data);
        }
    }

    private void validateAtLeastOneDocument(
            MultipartFile panCard,
            MultipartFile aadhaarCard,
            MultipartFile businessRegistrationProof,
            MultipartFile principalPlaceAddressProof,
            MultipartFile bankPassbookOrCancelledCheque,
            MultipartFile passportSizePhotograph) {

        if (isEmpty(panCard)
                && isEmpty(aadhaarCard)
                && isEmpty(businessRegistrationProof)
                && isEmpty(principalPlaceAddressProof)
                && isEmpty(bankPassbookOrCancelledCheque)
                && isEmpty(passportSizePhotograph)) {

            throw new IllegalArgumentException(
                    "Please select at least one document");
        }
    }

    private boolean isEmpty(MultipartFile file) {

        return file == null || file.isEmpty();
    }

    private String generateDocumentId() {

        return "DOC" + UUID.randomUUID().toString().replace("-", "");
    }
}


