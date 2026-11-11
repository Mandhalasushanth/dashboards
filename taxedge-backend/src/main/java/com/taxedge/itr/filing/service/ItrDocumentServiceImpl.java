package com.taxedge.itr.filing.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.validator.GstFileUploadValidator;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.itr.filing.dto.DocumentDto;
import com.taxedge.itr.filing.entity.ItrDocument;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.enums.ItrDocumentType;
import com.taxedge.itr.filing.mapper.ItrDocumentMapper;
import com.taxedge.itr.filing.repository.ItrDocumentRepository;
import com.taxedge.itr.filing.repository.ItrFilingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ItrDocumentServiceImpl implements ItrDocumentService {

	private final ItrDocumentRepository itrDocumentRepository;

	private final ItrFilingRepository itrFilingRepository;

	private final ItrDocumentMapper itrDocumentMapper;

	private final GstFileUploadValidator fileUploadValidator;

	@Override
	public String registerDocuments(String itrId, MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips,
			MultipartFile capitalGainsStatement, MultipartFile businessTurnover) throws IOException {

		ItrFiling itrFiling = itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR Filing not found with ID: " + itrId));

		validateAtLeastOneDocument(form16PartAPartB, form26as, aisTis, bankAccountStatement, salaryPayslips,
				capitalGainsStatement, businessTurnover);

		if (itrDocumentRepository.existsByItrFiling_ItrId(itrId)) {
			throw new IllegalArgumentException("Documents already exist for ITR ID: " + itrId);
		}

		DocumentDto dto = DocumentDto.builder()
				.form16PartAPartB(storeFile(form16PartAPartB, ItrDocumentType.FORM_16_PART_A_PART_B))
				.form26as(storeFile(form26as, ItrDocumentType.FORM_26AS))
				.aisTis(storeFile(aisTis, ItrDocumentType.AIS_TIS))
				.bankAccountStatement(storeFile(bankAccountStatement, ItrDocumentType.BANK_ACCOUNT_STATEMENT))
				.salaryPayslips(storeFile(salaryPayslips, ItrDocumentType.SALARY_PAYSLIPS))
				.capitalGainsStatement(storeFile(capitalGainsStatement, ItrDocumentType.CAPITAL_GAINS_STATEMENT))
				.businessTurnover(storeFile(businessTurnover, ItrDocumentType.BUSINESS_TURNOVER))
				.build();

		ItrDocument itrDocument = itrDocumentMapper.toEntity(dto);

		itrDocument.setDocumentId("FIL" + UUID.randomUUID().toString().replace("-", ""));

		itrDocument.setItrFiling(itrFiling);

		itrDocumentRepository.save(itrDocument);

		return "ITR documents registered successfully. Document ID: " + itrDocument.getDocumentId();
	}

	@Override
	@Transactional(readOnly = true)
	public DocumentDto getDocuments(String documentId) {

		ItrDocument itrDocument = itrDocumentRepository.findById(documentId)
				.or(() -> itrDocumentRepository.findByItrFiling_ItrId(documentId))
				.orElseThrow(() -> new ResourceNotFoundException("ITR documents not found with ID: " + documentId));

		return itrDocumentMapper.toDto(itrDocument);
	}

	@Override
	public String updateDocuments(String documentId, MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips,
			MultipartFile capitalGainsStatement, MultipartFile businessTurnover) throws IOException {

		ItrDocument itrDocument = itrDocumentRepository.findById(documentId)
				.or(() -> itrDocumentRepository.findByItrFiling_ItrId(documentId))
				.orElseThrow(() -> new ResourceNotFoundException("ITR documents not found with ID: " + documentId));

		validateAtLeastOneDocument(form16PartAPartB, form26as, aisTis, bankAccountStatement, salaryPayslips,
				capitalGainsStatement, businessTurnover);

		updateFile(itrDocument, form16PartAPartB, ItrDocumentType.FORM_16_PART_A_PART_B);

		updateFile(itrDocument, form26as, ItrDocumentType.FORM_26AS);

		updateFile(itrDocument, aisTis, ItrDocumentType.AIS_TIS);

		updateFile(itrDocument, bankAccountStatement, ItrDocumentType.BANK_ACCOUNT_STATEMENT);

		updateFile(itrDocument, salaryPayslips, ItrDocumentType.SALARY_PAYSLIPS);

		updateFile(itrDocument, capitalGainsStatement, ItrDocumentType.CAPITAL_GAINS_STATEMENT);

		updateFile(itrDocument, businessTurnover, ItrDocumentType.BUSINESS_TURNOVER);

		itrDocumentRepository.save(itrDocument);

		return "ITR documents updated successfully. Document ID: " + itrDocument.getDocumentId();
	}

	@Override
	public String deleteDocuments(String documentId) {

		ItrDocument itrDocument = itrDocumentRepository.findById(documentId)
				.or(() -> itrDocumentRepository.findByItrFiling_ItrId(documentId))
				.orElseThrow(() -> new ResourceNotFoundException("ITR documents not found with ID: " + documentId));

		itrDocumentRepository.delete(itrDocument);

		return "ITR documents deleted successfully";
	}

	private byte[] storeFile(MultipartFile file, ItrDocumentType documentType) throws IOException {

		if (file == null || file.isEmpty()) {
			return null;
		}

		fileUploadValidator.validate(file, documentType.name());

		return file.getBytes();
	}

	private void updateFile(ItrDocument itrDocument, MultipartFile file, ItrDocumentType documentType)
			throws IOException {

		if (file == null || file.isEmpty()) {
			return;
		}

		fileUploadValidator.validate(file, documentType.name());

		byte[] data = file.getBytes();

		switch (documentType) {

		case FORM_16_PART_A_PART_B -> itrDocument.setForm16PartAPartB(data);

		case FORM_26AS -> itrDocument.setForm26as(data);

		case AIS_TIS -> itrDocument.setAisTis(data);

		case BANK_ACCOUNT_STATEMENT -> itrDocument.setBankAccountStatement(data);

		case SALARY_PAYSLIPS -> itrDocument.setSalaryPayslips(data);

		case CAPITAL_GAINS_STATEMENT -> itrDocument.setCapitalGainsStatement(data);

		case BUSINESS_TURNOVER -> itrDocument.setBusinessTurnover(data);
		}
	}

	private void validateAtLeastOneDocument(MultipartFile form16PartAPartB, MultipartFile form26as,
			MultipartFile aisTis, MultipartFile bankAccountStatement, MultipartFile salaryPayslips,
			MultipartFile capitalGainsStatement, MultipartFile businessTurnover) {

		if (isEmpty(form16PartAPartB) && isEmpty(form26as) && isEmpty(aisTis) && isEmpty(bankAccountStatement)
				&& isEmpty(salaryPayslips) && isEmpty(capitalGainsStatement) && isEmpty(businessTurnover)) {

			throw new IllegalArgumentException("At least one document is required");
		}
	}

	private boolean isEmpty(MultipartFile file) {
		return file == null || file.isEmpty();
	}
}
