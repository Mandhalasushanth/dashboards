package com.taxedge.gst.compliance.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.gst.compliance.dto.GstComplianceDto;
import com.taxedge.gst.compliance.dto.GstComplianceResponseDto;
import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.compliance.enums.ComplianceRequestType;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.compliance.mapper.GstComplianceMapper;
import com.taxedge.gst.compliance.repository.GstComplianceRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.validator.GstFileUploadValidator;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GstComplianceServiceImpl implements GstComplianceService {

	private final GstComplianceRepository gstComplianceRepository;
	private final CustomerRepository customerRepository;
	private final GstComplianceMapper gstComplianceMapper;
	private final GstFileUploadValidator gstFileUploadValidator;
	private final FcmNotificationService fcmNotificationService;
	private final EmailService emailService;

	@Override
	public GstComplianceResponseDto createCompliance(GstComplianceDto gstComplianceDto,
			MultipartFile reconciliationFile1, MultipartFile reconciliationFile2, MultipartFile noticeFile)
			throws IOException {

		String gstin = normalizeAndValidateGstin(gstComplianceDto.getGstin());

		Customer customer = customerRepository.findById(gstComplianceDto.getCustomerId()).orElseThrow(
				() -> new ResourceNotFoundException("Customer not found with ID: " + gstComplianceDto.getCustomerId()));

		validateRequestTypeData(gstComplianceDto, reconciliationFile1, reconciliationFile2, noticeFile);

		GstCompliance compliance = GstCompliance.builder().complinaceId(generateComplianceId()).gstin(gstin)
				.customer(customer).financialYear(gstComplianceDto.getFinancialYear())
				.requestType(gstComplianceDto.getRequestType()).message(gstComplianceDto.getMessage()).build();

		switch (gstComplianceDto.getRequestType()) {

		case RECONCILIATION_SUPPORT -> {
			compliance.setGstr2bNumber(gstComplianceDto.getGstr2bNumber());
		}

		case NOTICE_RESPONSE -> {
			compliance.setNoticeNumber(gstComplianceDto.getNoticeNumber());
			compliance.setNoticeIssueDate(gstComplianceDto.getNoticeIssueDate());
			compliance.setReplyDueDate(gstComplianceDto.getReplyDueDate());
		}

		default -> throw new IllegalArgumentException("Unsupported compliance request type");
		}

		if (reconciliationFile1 != null && !reconciliationFile1.isEmpty()) {
			compliance.setReconciliationFile1(storeFile(reconciliationFile1, "reconciliationFile1"));
		}
		if (reconciliationFile2 != null && !reconciliationFile2.isEmpty()) {
			compliance.setReconciliationFile2(storeFile(reconciliationFile2, "reconciliationFile2"));
		}
		if (noticeFile != null && !noticeFile.isEmpty()) {
			compliance.setNoticeFile(storeFile(noticeFile, "noticeFile"));
		}

		clearIrrelevantFields(compliance);

		gstComplianceRepository.save(compliance);

		return GstComplianceResponseDto.builder().complianceId(compliance.getComplinaceId()).status("CREATED")
				.requestType(compliance.getRequestType()).build();
	}

	@Override
	public GstComplianceDto getCompliance(String gstin, String id) {

		String normalizedGstin = normalizeAndValidateGstin(gstin);

		GstCompliance compliance = gstComplianceRepository.findByComplinaceIdAndGstin(id, normalizedGstin)
				.orElseThrow(() -> new ResourceNotFoundException(
						"GST compliance not found with ID: " + id + " and GSTIN: " + normalizedGstin));

		return gstComplianceMapper.toDto(compliance);
	}

	@Override
	public GstComplianceResponseDto updateCompliance(String gstin, String id, GstComplianceDto gstComplianceDto,
			MultipartFile reconciliationFile1, MultipartFile reconciliationFile2, MultipartFile noticeFile)
			throws IOException {

		String normalizedGstin = normalizeAndValidateGstin(gstin);

		GstCompliance compliance = gstComplianceRepository.findByComplinaceIdAndGstin(id, normalizedGstin)
				.orElseThrow(() -> new ResourceNotFoundException(
						"GST compliance not found with ID: " + id + " and GSTIN: " + normalizedGstin));

		if (gstComplianceDto.getRequestType() == null) {
			throw new IllegalArgumentException("Request type is required for update");
		}

		compliance.setRequestType(gstComplianceDto.getRequestType());

		compliance.setFinancialYear(gstComplianceDto.getFinancialYear());
		compliance.setMessage(gstComplianceDto.getMessage());

		switch (gstComplianceDto.getRequestType()) {

		case RECONCILIATION_SUPPORT -> {
			validateReconciliationUpdate(gstComplianceDto, reconciliationFile1, reconciliationFile2, compliance);
			compliance.setGstr2bNumber(gstComplianceDto.getGstr2bNumber());
		}

		case NOTICE_RESPONSE -> {
			validateNoticeUpdate(gstComplianceDto, noticeFile, compliance);
			compliance.setNoticeNumber(gstComplianceDto.getNoticeNumber());
			compliance.setNoticeIssueDate(gstComplianceDto.getNoticeIssueDate());
			compliance.setReplyDueDate(gstComplianceDto.getReplyDueDate());
		}

		default -> throw new IllegalArgumentException("Unsupported compliance request type");
		}

		if (reconciliationFile1 != null && !reconciliationFile1.isEmpty()) {
			compliance.setReconciliationFile1(storeFile(reconciliationFile1, "reconciliationFile1"));
		}
		if (reconciliationFile2 != null && !reconciliationFile2.isEmpty()) {
			compliance.setReconciliationFile2(storeFile(reconciliationFile2, "reconciliationFile2"));
		}
		if (noticeFile != null && !noticeFile.isEmpty()) {
			compliance.setNoticeFile(storeFile(noticeFile, "noticeFile"));
		}

		clearIrrelevantFields(compliance);

		gstComplianceRepository.save(compliance);

		return GstComplianceResponseDto.builder().complianceId(compliance.getComplinaceId()).status("UPDATED")
				.requestType(compliance.getRequestType()).build();
	}

	@Override
	public String deleteCompliance(String gstin, String id) {

		String normalizedGstin = normalizeAndValidateGstin(gstin);

		GstCompliance compliance = gstComplianceRepository.findByComplinaceIdAndGstin(id, normalizedGstin)
				.orElseThrow(() -> new ResourceNotFoundException(
						"GST compliance not found with ID: " + id + " and GSTIN: " + normalizedGstin));

		gstComplianceRepository.delete(compliance);

		return "GST compliance deleted successfully";
	}

	private void validateRequestTypeData(GstComplianceDto dto, MultipartFile reconciliationFile1,
			MultipartFile reconciliationFile2, MultipartFile noticeFile) {

		if (dto.getRequestType() == null) {
			throw new IllegalArgumentException("Request type is required");
		}

		switch (dto.getRequestType()) {

		case RECONCILIATION_SUPPORT -> {
			validateReconciliationSupport(dto, reconciliationFile1, reconciliationFile2);
		}

		case NOTICE_RESPONSE -> {
			validateNoticeResponse(dto, noticeFile);
		}

		default -> throw new IllegalArgumentException("Unsupported compliance request type");
		}
	}

	private void validateReconciliationSupport(GstComplianceDto dto, MultipartFile reconciliationFile1,
			MultipartFile reconciliationFile2) {

		if (dto.getGstr2bNumber() == null || dto.getGstr2bNumber().isBlank()) {

			throw new IllegalArgumentException("GSTR-2B number is required for reconciliation support");
		}

		if ((reconciliationFile1 == null || reconciliationFile1.isEmpty()) && (reconciliationFile2 == null || reconciliationFile2.isEmpty())) {
			throw new IllegalArgumentException("At least one document (Purchase Register or Sales Register) is required for reconciliation support");
		}

		if (reconciliationFile1 != null && !reconciliationFile1.isEmpty()) {
			gstFileUploadValidator.validate(reconciliationFile1, "reconciliationFile1");
		}

		if (reconciliationFile2 != null && !reconciliationFile2.isEmpty()) {
			gstFileUploadValidator.validate(reconciliationFile2, "reconciliationFile2");
		}
	}

	private void validateNoticeResponse(GstComplianceDto dto, MultipartFile noticeFile) {

		if (dto.getNoticeNumber() == null || dto.getNoticeNumber().isBlank() || dto.getNoticeIssueDate() == null
				|| dto.getReplyDueDate() == null) {

			throw new IllegalArgumentException("Notice number, notice issue date and reply due date are required");
		}

		if (dto.getReplyDueDate().isBefore(dto.getNoticeIssueDate())) {

			throw new IllegalArgumentException("Reply due date must not be before notice issue date");
		}

		gstFileUploadValidator.validate(noticeFile, "noticeFile");
	}

	private void validateReconciliationUpdate(GstComplianceDto dto, MultipartFile reconciliationFile1,
			MultipartFile reconciliationFile2, GstCompliance compliance) {

		if (dto.getGstr2bNumber() == null || dto.getGstr2bNumber().isBlank()) {

			throw new IllegalArgumentException("GSTR-2B number is required for reconciliation support");
		}

		if (reconciliationFile1 == null && reconciliationFile2 == null && compliance.getReconciliationFile1() == null && compliance.getReconciliationFile2() == null) {
			throw new IllegalArgumentException("At least one reconciliation file is required");
		}

		if (reconciliationFile1 != null && !reconciliationFile1.isEmpty()) {

			gstFileUploadValidator.validate(reconciliationFile1, "reconciliationFile1");
		}

		if (reconciliationFile2 != null && !reconciliationFile2.isEmpty()) {

			gstFileUploadValidator.validate(reconciliationFile2, "reconciliationFile2");
		}
	}

	private void validateNoticeUpdate(GstComplianceDto dto, MultipartFile noticeFile, GstCompliance compliance) {

		validateNoticeResponseData(dto);

		if (noticeFile == null && compliance.getNoticeFile() == null) {

			throw new IllegalArgumentException("Notice file is required");
		}

		if (noticeFile != null && !noticeFile.isEmpty()) {

			gstFileUploadValidator.validate(noticeFile, "noticeFile");
		}
	}

	private void validateNoticeResponseData(GstComplianceDto dto) {

		if (dto.getNoticeNumber() == null || dto.getNoticeNumber().isBlank() || dto.getNoticeIssueDate() == null
				|| dto.getReplyDueDate() == null) {

			throw new IllegalArgumentException("Notice number, notice issue date and reply due date are required");
		}

		if (dto.getReplyDueDate().isBefore(dto.getNoticeIssueDate())) {

			throw new IllegalArgumentException("Reply due date must not be before notice issue date");
		}
	}

	private void clearIrrelevantFields(GstCompliance compliance) {

		switch (compliance.getRequestType()) {

		case RECONCILIATION_SUPPORT -> {
			if (compliance.getNoticeNumber() == null || compliance.getNoticeNumber().isBlank()) {
				compliance.setNoticeNumber(null);
				compliance.setNoticeIssueDate(null);
				compliance.setReplyDueDate(null);
			}
		}

		case NOTICE_RESPONSE -> {
			if (compliance.getGstr2bNumber() == null || compliance.getGstr2bNumber().isBlank()) {
				compliance.setGstr2bNumber(null);
			}
		}

		default -> throw new IllegalArgumentException("Unsupported compliance request type");
		}
	}

	private String normalizeAndValidateGstin(String gstin) {

		if (gstin == null || gstin.isBlank()) {
			throw new IllegalArgumentException("GSTIN is required");
		}

		String normalizedGstin = gstin.trim().toUpperCase();

		if (!normalizedGstin.matches("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$")) {

			throw new IllegalArgumentException("Invalid GSTIN format");
		}

		return normalizedGstin;
	}

	private byte[] storeFile(MultipartFile file, String documentType) throws IOException {

		gstFileUploadValidator.validate(file, documentType);

		return file.getBytes();
	}

	private String generateComplianceId() {

		return "COM" + UUID.randomUUID().toString().replace("-", "");
	}

	@Override
	public String submitCompliance(String complianceId, String pushToken) {

		GstCompliance compliance = gstComplianceRepository.findById(complianceId)
				.orElseThrow(() -> new ResourceNotFoundException("GST compliance not found with id: " + complianceId));

		RegisterationStatus currentStatus = compliance.getStatus();
		if (currentStatus != null && currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
			throw new IllegalStateException(
					"GST compliance " + complianceId + " cannot be submitted. Current status: " + currentStatus);
		}

		compliance.setStatus(RegisterationStatus.SUBMITTED);
		compliance.setSubmittedAt(LocalDateTime.now());
		gstComplianceRepository.save(compliance);

		Customer customer = compliance.getCustomer();

		// Save token if new or changed
		if (pushToken != null && !pushToken.isBlank() && customer != null && !pushToken.equals(customer.getPushToken())) {
			customer.setPushToken(pushToken);
			customerRepository.save(customer);
		}

		String resolvedToken = (pushToken != null && !pushToken.isBlank())
				? pushToken
				: (customer != null ? customer.getPushToken() : null);

		String applicantName = (customer != null && customer.getName() != null && !customer.getName().isBlank())
				? customer.getName()
				: compliance.getGstin();

		if (resolvedToken != null && !resolvedToken.isBlank() && fcmNotificationService != null) {
			try {
				fcmNotificationService.sendSuccessNotification(resolvedToken, applicantName);
			} catch (Exception ex) {
				log.error("Push notification failed for GST compliance id {}", complianceId, ex);
			}
		}

		// Confirmation email
		try {
			if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank() && emailService != null) {
				String recipientEmail = customer.getEmail();
				String recipientName = (customer.getName() != null && !customer.getName().isBlank()) ? customer.getName() : "Valued Customer";
				emailService.sendRegistrationEmail(recipientEmail, recipientName);
			}
		} catch (Exception ex) {
			log.error("Confirmation email failed for GST compliance id {}", complianceId, ex);
		}

		return "GST compliance submitted successfully. Compliance ID: " + complianceId;
	}
}
