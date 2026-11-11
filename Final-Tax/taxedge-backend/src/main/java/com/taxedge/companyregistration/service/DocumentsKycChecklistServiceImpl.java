package com.taxedge.companyregistration.service;

import java.io.IOException;
import java.util.UUID;
import java.util.function.Consumer;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.companyregistration.dto.DocumentsKycChecklistDto;
import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.entity.DocumentsKycChecklist;
import com.taxedge.companyregistration.repository.CompanyDetailsRepository;
import com.taxedge.companyregistration.repository.DocumentsKycChecklistRepository;
import com.taxedge.validator.GstFileUploadValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentsKycChecklistServiceImpl implements DocumentsKycChecklistService {

	private final DocumentsKycChecklistRepository documentsRepository;
	private final CompanyDetailsRepository companyDetailsRepository;
	private final GstFileUploadValidator fileUploadValidator;

	@Override
	public String uploadDocuments(String companyRegistrationId, DocumentsKycChecklistDto dto) throws IOException {

		CompanyDetails company = getCompany(companyRegistrationId);

		java.util.Optional<DocumentsKycChecklist> existingOpt = documentsRepository.findByCompanyDetails_CompanyRegistrationId(companyRegistrationId);
		if (existingOpt.isPresent()) {
			return updateDocumentsById(existingOpt.get().getDocumentId(), dto);
		}

		validateAtLeastOneDocument(dto);

		DocumentsKycChecklist documents = DocumentsKycChecklist.builder()
				.documentId("DOC" + UUID.randomUUID().toString().replace("-", "")).companyDetails(company)
				.panCard(storeFile(dto.getPanCard(), "PAN Card"))
				.identityAddressProof(storeFile(dto.getIdentityAddressProof(), "Identity/Address Proof"))
				.passportPhoto(storeFile(dto.getPassportPhoto(), "Passport Photo"))
				.officeAddressProof(storeFile(dto.getOfficeAddressProof(), "Office Address Proof"))
				.officeUtilityBill(storeFile(dto.getOfficeUtilityBill(), "Office Utility Bill"))
				.ownerNoc(storeFile(dto.getOwnerNoc(), "Owner NOC"))
				.statutoryDocuments(storeFile(dto.getStatutoryDocuments(), "Statutory Documents"))
				.aoaEAoa(storeFile(dto.getAoaEAoa(), "AOA/E-AOA")).build();

		documentsRepository.save(documents);

		return "Documents uploaded successfully. Document ID: " + documents.getDocumentId();
	}

	@Override
	@Transactional(readOnly = true)
	public DocumentsKycChecklistDto getDocumentsById(String documentId) {

		DocumentsKycChecklist documents = getDocumentsEntity(documentId);

		return DocumentsKycChecklistDto.builder().documentId(documents.getDocumentId())
				.companyRegistrationId(documents.getCompanyDetails().getCompanyRegistrationId()).build();
	}

	@Override
	public String updateDocumentsById(String documentId, DocumentsKycChecklistDto dto) throws IOException {

		DocumentsKycChecklist documents = getDocumentsEntity(documentId);

		validateAtLeastOneDocument(dto);

		updateFile(dto.getPanCard(), "PAN Card", documents::setPanCard);
		updateFile(dto.getIdentityAddressProof(), "Identity/Address Proof", documents::setIdentityAddressProof);
		updateFile(dto.getPassportPhoto(), "Passport Photo", documents::setPassportPhoto);
		updateFile(dto.getOfficeAddressProof(), "Office Address Proof", documents::setOfficeAddressProof);
		updateFile(dto.getOfficeUtilityBill(), "Office Utility Bill", documents::setOfficeUtilityBill);
		updateFile(dto.getOwnerNoc(), "Owner NOC", documents::setOwnerNoc);
		updateFile(dto.getStatutoryDocuments(), "Statutory Documents", documents::setStatutoryDocuments);
		updateFile(dto.getAoaEAoa(), "AOA/E-AOA", documents::setAoaEAoa);

		documentsRepository.save(documents);

		return "Documents updated successfully. Document ID: " + documents.getDocumentId();
	}

	@Override
	public String deleteDocumentsById(String documentId) {

		DocumentsKycChecklist documents = getDocumentsEntity(documentId);

		documentsRepository.delete(documents);

		return "Documents deleted successfully.";
	}

	private CompanyDetails getCompany(String companyRegistrationId) {

		return companyDetailsRepository.findById(companyRegistrationId)
				.orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyRegistrationId));
	}

	private DocumentsKycChecklist getDocumentsEntity(String documentId) {

		return documentsRepository.findById(documentId)
				.orElseThrow(() -> new IllegalArgumentException("Documents not found with ID: " + documentId));
	}

	private byte[] storeFile(MultipartFile file, String documentType) throws IOException {

		if (isEmpty(file)) {
			return null;
		}

		fileUploadValidator.validate(file, documentType);

		return file.getBytes();
	}

	private void updateFile(MultipartFile file, String documentType, Consumer<byte[]> setter) throws IOException {

		if (!isEmpty(file)) {
			setter.accept(storeFile(file, documentType));
		}
	}

	private boolean isEmpty(MultipartFile file) {
		return file == null || file.isEmpty();
	}

	private void validateAtLeastOneDocument(DocumentsKycChecklistDto dto) {

		if (isEmpty(dto.getPanCard()) && isEmpty(dto.getIdentityAddressProof()) && isEmpty(dto.getPassportPhoto())
				&& isEmpty(dto.getOfficeAddressProof()) && isEmpty(dto.getOfficeUtilityBill())
				&& isEmpty(dto.getOwnerNoc()) && isEmpty(dto.getStatutoryDocuments()) && isEmpty(dto.getAoaEAoa())) {

			throw new IllegalArgumentException("Upload at least one document.");
		}
	}
}
