package com.taxedge.itr.reviseditr.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.reviseditr.dto.RevisedItrDto;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.mapper.RevisedItrMapper;
import com.taxedge.itr.reviseditr.repository.RevisedItrRepository;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RevisedItrServiceImpl implements RevisedItrService {

	private final RevisedItrRepository revisedItrRepository;
	private final CustomerRepository customerRepository;
	private final RevisedItrMapper revisedItrMapper;
	private final FcmNotificationService fcmNotificationService;
	private final EmailService emailService;

	@Override
	public String createRevisedItr(RevisedItrDto dto) {

		Customer customer = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

		RevisedItr revisedItr = RevisedItr.builder()
				.revisedItrId("RITR" + UUID.randomUUID().toString().replace("-", ""))
				.itrAcknowledgementNumber(dto.getItrAcknowledgementNumber()).assessmentYear(dto.getAssessmentYear())
				.customer(customer).status(RegisterationStatus.DRAFT).build();

		revisedItrRepository.save(revisedItr);

		return "Revised ITR details registered successfully. Revised ITR ID: " + revisedItr.getRevisedItrId();
	}

	@Override
	public RevisedItrDto getRevisedItr(String revisedItrId) {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR not found with ID: " + revisedItrId));

		RevisedItrDto dto = RevisedItrDto.builder().customerId(revisedItr.getCustomer().getCustId())
				.itrAcknowledgementNumber(revisedItr.getItrAcknowledgementNumber())
				.assessmentYear(revisedItr.getAssessmentYear()).build();

		return dto;
	}

	@Override
	public String updateRevisedItr(String revisedItrId, RevisedItrDto dto) {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR not found with ID: " + revisedItrId));

		revisedItrMapper.updateEntity(dto, revisedItr);

		revisedItrRepository.save(revisedItr);

		return "Revised ITR details updated successfully. Revised ITR ID: "
        + revisedItr.getRevisedItrId();
	}

	@Override
	@Transactional
	public String submitRevisedItr(String revisedItrId, String pushToken) {

		RevisedItr revisedItr = revisedItrRepository.findById(revisedItrId)
				.orElseThrow(() -> new ResourceNotFoundException("Revised ITR not found with ID: " + revisedItrId));

		RegisterationStatus currentStatus = revisedItr.getStatus();
		if (currentStatus == RegisterationStatus.SUBMITTED) {
			log.info("Revised ITR {} is already submitted, treating as idempotent success", revisedItrId);
			return "Revised ITR submitted successfully. Revised ITR ID: " + revisedItrId;
		}
		if (currentStatus != null && currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
			throw new IllegalStateException(
					"Revised ITR " + revisedItrId + " cannot be submitted. Current status: " + currentStatus);
		}

		revisedItr.setStatus(RegisterationStatus.SUBMITTED);
		revisedItr.setSubmittedAt(LocalDateTime.now());
		revisedItrRepository.save(revisedItr);

		Customer customer = revisedItr.getCustomer();

		// Save token if new or changed (tokens rotate)
		if (pushToken != null && !pushToken.isBlank() && customer != null && !pushToken.equals(customer.getPushToken())) {
			customer.setPushToken(pushToken);
			customerRepository.save(customer);
		}

		String resolvedToken = (pushToken != null && !pushToken.isBlank())
				? pushToken
				: (customer != null ? customer.getPushToken() : null);

		String applicantName = (customer != null && customer.getName() != null && !customer.getName().isBlank())
				? customer.getName()
				: "Valued Customer";

		// Push notification
		if (resolvedToken != null && !resolvedToken.isBlank() && fcmNotificationService != null) {
			try {
				fcmNotificationService.sendRegistrationSuccessNotification(resolvedToken, applicantName);
			} catch (Exception ex) {
				log.error("Push notification failed for Revised ITR id {}", revisedItrId, ex);
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
			log.error("Confirmation email failed for Revised ITR id {}", revisedItrId, ex);
		}

		return "Revised ITR submitted successfully. Revised ITR ID: " + revisedItrId;
	}
}
