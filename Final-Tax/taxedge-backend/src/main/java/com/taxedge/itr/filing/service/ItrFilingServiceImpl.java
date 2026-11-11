package com.taxedge.itr.filing.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.filing.dto.ItrFilingPostDto;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.mapper.ItrFilingMapper;
import com.taxedge.itr.filing.repository.ItrFilingRepository;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class ItrFilingServiceImpl implements ItrFilingService {

	private final ItrFilingRepository itrFilingRepository;

	private final CustomerRepository customerRepository;

	private final ItrFilingMapper itrFilingMapper;

	private final FcmNotificationService fcmNotificationService;

	private final EmailService emailService;

	@Override
	public String createItrFiling(ItrFilingPostDto dto) {

		Customer customer = resolveCustomer(dto.getCustomerId());

		ItrFiling itrFiling = itrFilingMapper.toEntity(dto);

		itrFiling.setCustomer(customer);
		itrFiling.setStatus(RegisterationStatus.DRAFT);

		String itrId = "ITR" + UUID.randomUUID().toString().replace("-", "");

		itrFiling.setItrId(itrId);

		itrFilingRepository.save(itrFiling);

		return "ITR Filing details registered successfully. ITR ID: " + itrId;
	}

	private Customer resolveCustomer(String candidateId) {
		// 1. Try finding by the provided candidate ID
		if (candidateId != null && !candidateId.isBlank()) {
			Optional<Customer> byId = customerRepository.findById(candidateId.trim());
			if (byId.isPresent()) {
				return byId.get();
			}
			// 2. Try finding by mobile number in case candidateId is a phone number
			Optional<Customer> byMobile = customerRepository.findByMobileNumber(candidateId.trim());
			if (byMobile.isPresent()) {
				return byMobile.get();
			}
		}

		// 3. Fallback to authenticated user principal from JWT
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null) {
			if (auth.getPrincipal() instanceof JwtPrincipal principal) {
				if (principal.custId() != null && !principal.custId().isBlank()) {
					Optional<Customer> byPrincipalId = customerRepository.findById(principal.custId().trim());
					if (byPrincipalId.isPresent()) {
						return byPrincipalId.get();
					}
				}
				if (principal.mobileNumber() != null && !principal.mobileNumber().isBlank()) {
					Optional<Customer> byPrincipalMobile = customerRepository.findByMobileNumber(principal.mobileNumber().trim());
					if (byPrincipalMobile.isPresent()) {
						return byPrincipalMobile.get();
					}
				}
			} else if (auth.getName() != null && !auth.getName().isBlank() && !auth.getName().equals("anonymousUser")) {
				Optional<Customer> byAuthName = customerRepository.findById(auth.getName().trim());
				if (byAuthName.isPresent()) {
					return byAuthName.get();
				}
				Optional<Customer> byAuthMobile = customerRepository.findByMobileNumber(auth.getName().trim());
				if (byAuthMobile.isPresent()) {
					return byAuthMobile.get();
				}
			}
		}

		throw new ResourceNotFoundException("Customer not found with ID or session: " + candidateId);
	}

	@Override
	public String updateItrFiling(String itrId, ItrFilingPostDto dto) {

		ItrFiling itrFiling = itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR Filing details not found with ITR ID: " + itrId));

		itrFilingMapper.updateEntity(dto, itrFiling);

		itrFilingRepository.save(itrFiling);

		return "ITR Filing details updated successfully. ITR ID: " + itrFiling.getItrId();
	}

	@Override
	public ItrFiling getItrFiling(String itrId) {

		return itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR Filing details not found with ITR ID: " + itrId));
	}

	@Override
	@Transactional
	public String submitItrFiling(String itrId, String pushToken) {

		ItrFiling itrFiling = itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR filing not found with ID: " + itrId));

		RegisterationStatus currentStatus = itrFiling.getStatus();
		if (currentStatus == RegisterationStatus.SUBMITTED) {
			return "ITR Filing already submitted. Current status: " + currentStatus;
		}

		itrFiling.setStatus(RegisterationStatus.SUBMITTED);
		itrFilingRepository.save(itrFiling);

		Customer customer = itrFiling.getCustomer();
		if (customer == null) {
			log.warn("ITR filing [{}] has no associated customer; skipping push notification.", itrId);
			return "ITR Filing details submitted successfully. ITR ID: " + itrId;
		}

		// Update customer pushToken if provided
		if (pushToken != null && !pushToken.isBlank() && !pushToken.equals(customer.getPushToken())) {
			customer.setPushToken(pushToken);
			customerRepository.save(customer);
			log.info("Updated pushToken for customer [{}] during ITR submit.", customer.getCustId());
		}

		String resolvedToken = (pushToken != null && !pushToken.isBlank())
				? pushToken
				: customer.getPushToken();

		String recipientName = (customer.getName() != null && !customer.getName().isBlank())
				? customer.getName()
				: "Valued Customer";

		if (resolvedToken != null && !resolvedToken.isBlank() && fcmNotificationService != null) {
			try {
				fcmNotificationService.sendSuccessNotification(resolvedToken, recipientName);
			} catch (Exception ex) {
				log.error("Failed to send ITR submission push notification for filing [{}]: {}",
						itrId, ex.getMessage());
			}
		}

		if (customer.getEmail() != null && !customer.getEmail().isBlank() && emailService != null) {
			try {
				emailService.sendRegistrationEmail(customer.getEmail(), recipientName);
			} catch (Exception ex) {
				log.error("Failed to send ITR submission email to [{}]: {}",
						customer.getEmail(), ex.getMessage());
			}
		}

		return "ITR Filing details submitted successfully. ITR ID: " + itrId;
	}
}
