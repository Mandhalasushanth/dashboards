package com.taxedge.gst.registration.service;



import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.registration.dto.BusinessRequest;
import com.taxedge.gst.registration.dto.BusinessResponse;
import com.taxedge.gst.registration.dto.BusinessUpdateRequest;
import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.gst.registration.mapper.BusinessMapper;
import com.taxedge.gst.registration.repository.BusinessRepository;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusinessServiceImpl implements BusinessService {

	private final BusinessRepository businessRepository;

	private final CustomerRepository customerRepository;

	private final BusinessMapper businessMapper;

	private final FcmNotificationService fcmNotificationService;

	private final EmailService emailService;

	@Override
	public String registerBusiness(BusinessRequest businessRequest) {

		Customer customer = customerRepository.findById(businessRequest.getCustomerId()).orElseThrow(
				() -> new ResourceNotFoundException("Customer not found with ID: " + businessRequest.getCustomerId()));

		String gstId = "GST" + UUID.randomUUID().toString().replace("-", "");

		Business business = Business.builder().gstId(gstId).customer(customer).legalName(businessRequest.getLegalName())
				.tradeName(businessRequest.getTradeName())
				.constitutionOfBusiness(businessRequest.getConstitutionOfBusiness())
				.natureOfBusiness(businessRequest.getNatureOfBusiness())
				.dateOfCommencement(businessRequest.getDateOfCommencement())
				.businessPan(businessRequest.getBusinessPan())
				.reasonForRegistration(businessRequest.getReasonForRegistration())
				.compositionScheme(businessRequest.getCompositionScheme())
				.placeOfBusiness(businessRequest.getPlaceOfBusiness())
				.businessAddress(businessRequest.getBusinessAddress()).city(businessRequest.getCity())
				.district(businessRequest.getDistrict()).state(businessRequest.getState())
				.pinCode(businessRequest.getPinCode()).hsnSac(businessRequest.getHsnSac())
				.accountHolderName(businessRequest.getAccountHolderName())
				.bankAccountNumber(businessRequest.getBankAccountNumber()).ifscCode(businessRequest.getIfscCode())
				.bankName(businessRequest.getBankName()).branchName(businessRequest.getBranchName())
				.accountType(businessRequest.getAccountType())
				.authorisedSignatory(businessRequest.getAuthorisedSignatory())
				.signatoryName(businessRequest.getSignatoryName()).signatoryPan(businessRequest.getSignatoryPan())
				.signatoryDob(businessRequest.getSignatoryDob()).designation(businessRequest.getDesignation())
				.signatoryMobile(businessRequest.getSignatoryMobile())
				.signatoryEmail(businessRequest.getSignatoryEmail()).build();

		businessRepository.save(business);

		return "Business details registered successfully. Business ID: " + gstId;
	}

	@Override
	@Transactional(readOnly = true)
	public BusinessResponse getBusiness(String gstId) {

		Business business = businessRepository.findById(gstId)
				.orElseThrow(() -> new ResourceNotFoundException("Business not found with gstId: " + gstId));

		return businessMapper.toResponse(business);
	}

	@Override
	public String updateBusiness(String gstId, BusinessUpdateRequest businessUpdateRequest) {

		Business business = businessRepository.findById(gstId)
				.orElseThrow(() -> new ResourceNotFoundException("Business not found with gstId: " + gstId));

		businessMapper.updateEntity(businessUpdateRequest, business);

		businessRepository.save(business);

		return "Business details updated successfully";
	}

	@Override
	public String deleteBusiness(String gstId) {

		Business business = businessRepository.findById(gstId)
				.orElseThrow(() -> new ResourceNotFoundException("Business not found with gstId: " + gstId));

		businessRepository.delete(business);

		return "Business details deleted successfully";
	}

	@Override
	@Transactional
	public String submitRegistration(String gstId, String pushToken) {

		Business business = businessRepository.findById(gstId)
				.orElseThrow(() -> new ResourceNotFoundException(
						"GST registration not found with id: " + gstId));

		RegisterationStatus currentStatus = business.getStatus();
		if (currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
			throw new IllegalStateException(
					"GST registration " + gstId + " cannot be submitted. Current status: " + currentStatus);
		}

		business.setStatus(RegisterationStatus.SUBMITTED);
		business.setSubmittedAt(LocalDateTime.now());
		businessRepository.save(business);

		Customer customer = business.getCustomer();

		// Save token if new or changed (tokens rotate)
		if (pushToken != null && !pushToken.isBlank() && customer != null && !pushToken.equals(customer.getPushToken())) {
			customer.setPushToken(pushToken);
			customerRepository.save(customer);
		}

		String resolvedToken = (pushToken != null && !pushToken.isBlank())
				? pushToken
				: (customer != null ? customer.getPushToken() : null);

		String applicantName = (business.getTradeName() != null && !business.getTradeName().isBlank())
				? business.getTradeName()
				: business.getLegalName();

		// Push notification
		if (resolvedToken != null && !resolvedToken.isBlank()) {
			try {
				fcmNotificationService.sendRegistrationSuccessNotification(resolvedToken, applicantName);
			} catch (Exception ex) {
				log.error("Push notification failed for GST id {}", gstId, ex);
			}
		}

		// Confirmation email
		try {
			if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank()) {
				String recipientEmail = customer.getEmail();
				String recipientName = (customer.getName() != null && !customer.getName().isBlank()) ? customer.getName() : "Valued Customer";
				emailService.sendRegistrationEmail(recipientEmail, recipientName);
			}
		} catch (Exception ex) {
			log.error("Confirmation email failed for GST id {}", gstId, ex);
		}

		return "GST Registration submitted successfully.";
	}
}
