package com.taxedge.itr.reviseditr.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.validator.GstFileUploadValidator;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.itr.reviseditr.dto.RevisedItrDocumentDto;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.entity.RevisedItrDocument;
import com.taxedge.itr.reviseditr.enums.RevisedItrDocumentType;
import com.taxedge.itr.reviseditr.mapper.RevisedItrDocumentMapper;
import com.taxedge.itr.reviseditr.repository.RevisedItrDocumentRepository;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RevisedItrDocumentServiceImpl implements RevisedItrDocumentService {

	private final RevisedItrDocumentRepository revisedItrDocumentRepository;

	private final RevisedItrRepository revisedItrRepository;

	private final RevisedItrDocumentMapper revisedItrDocumentMapper;

	private final GstFileUploadValidator fileUploadValidator;

	@Override
	public String registerDocuments(String revisedItrId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws IOException {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR not found with ID: " + revisedItrId));

		validateAtLeastOneDocument(panCard, aadhaarCard, form16Form16A, aisTisStatement, bankStatements,
				investmentProofs);

		RevisedItrDocument document = RevisedItrDocument.builder()
				.documentId("RID" + UUID.randomUUID().toString().replace("-", ""))
				.panCard(storeFile(panCard, RevisedItrDocumentType.PAN_CARD))
				.aadhaarCard(storeFile(aadhaarCard, RevisedItrDocumentType.AADHAAR_CARD))
				.form16Form16A(storeFile(form16Form16A, RevisedItrDocumentType.FORM_16_FORM_16A))
				.aisTisStatement(storeFile(aisTisStatement, RevisedItrDocumentType.AIS_TIS_STATEMENT))
				.bankStatements(storeFile(bankStatements, RevisedItrDocumentType.BANK_STATEMENTS))
				.investmentProofs(storeFile(investmentProofs, RevisedItrDocumentType.INVESTMENT_PROOFS))
				.revisedItr(revisedItr).build();

		revisedItrDocumentRepository.save(document);

		return "Revised ITR documents registered successfully. Document ID: " + document.getDocumentId();
	}

	@Override
	@Transactional(readOnly = true)
	public RevisedItrDocumentDto getDocuments(String documentId) {

		RevisedItrDocument document = revisedItrDocumentRepository.findById(documentId)
				.or(() -> revisedItrDocumentRepository.findByRevisedItrRevisedItrId(documentId).stream().findFirst())
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR documents not found with ID: " + documentId));

		return revisedItrDocumentMapper.toDto(document);
	}

	@Override
	public String updateDocuments(String documentId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) throws IOException {

		RevisedItrDocument document = revisedItrDocumentRepository.findById(documentId)
				.or(() -> revisedItrDocumentRepository.findByRevisedItrRevisedItrId(documentId).stream().findFirst())
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR documents not found with ID: " + documentId));

		validateAtLeastOneDocument(panCard, aadhaarCard, form16Form16A, aisTisStatement, bankStatements,
				investmentProofs);

		updateFile(document, panCard, RevisedItrDocumentType.PAN_CARD);

		updateFile(document, aadhaarCard, RevisedItrDocumentType.AADHAAR_CARD);

		updateFile(document, form16Form16A, RevisedItrDocumentType.FORM_16_FORM_16A);

		updateFile(document, aisTisStatement, RevisedItrDocumentType.AIS_TIS_STATEMENT);

		updateFile(document, bankStatements, RevisedItrDocumentType.BANK_STATEMENTS);

		updateFile(document, investmentProofs, RevisedItrDocumentType.INVESTMENT_PROOFS);

		revisedItrDocumentRepository.save(document);

		return "Revised ITR documents updated successfully. Document ID: " + document.getDocumentId();
	}

	@Override
	public String deleteDocuments(String documentId) {

		RevisedItrDocument document = revisedItrDocumentRepository.findById(documentId)
				.or(() -> revisedItrDocumentRepository.findByRevisedItrRevisedItrId(documentId).stream().findFirst())
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR documents not found with ID: " + documentId));

		revisedItrDocumentRepository.delete(document);

		return "Revised ITR documents deleted successfully";
	}

	private byte[] storeFile(MultipartFile file, RevisedItrDocumentType documentType) throws IOException {

		if (file == null || file.isEmpty()) {
			return null;
		}

		fileUploadValidator.validate(file, documentType.name());

		return file.getBytes();
	}

	private void updateFile(RevisedItrDocument document, MultipartFile file, RevisedItrDocumentType documentType)
			throws IOException {

		if (file == null || file.isEmpty()) {
			return;
		}

		fileUploadValidator.validate(file, documentType.name());

		byte[] data = file.getBytes();

		switch (documentType) {

		case PAN_CARD -> document.setPanCard(data);

		case AADHAAR_CARD -> document.setAadhaarCard(data);

		case FORM_16_FORM_16A -> document.setForm16Form16A(data);

		case AIS_TIS_STATEMENT -> document.setAisTisStatement(data);

		case BANK_STATEMENTS -> document.setBankStatements(data);

		case INVESTMENT_PROOFS -> document.setInvestmentProofs(data);
		}
	}

	private void validateAtLeastOneDocument(MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile form16Form16A, MultipartFile aisTisStatement, MultipartFile bankStatements,
			MultipartFile investmentProofs) {

		if (isEmpty(panCard) && isEmpty(aadhaarCard) && isEmpty(form16Form16A) && isEmpty(aisTisStatement)
				&& isEmpty(bankStatements) && isEmpty(investmentProofs)) {

			throw new IllegalArgumentException("At least one document is required");
		}
	}

	private boolean isEmpty(MultipartFile file) {
		return file == null || file.isEmpty();
	}
}
