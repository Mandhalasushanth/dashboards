package com.taxedge.gst.amendment.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Base64;
import java.util.Optional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.gst.amendment.dto.ContactAmendmentViewDto;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.mapper.ContactAmendmentMapper;
import com.taxedge.gst.amendment.repository.ContactAmendmentRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.gst.registration.repository.BusinessRepository;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactAmendmentServiceImpl implements ContactAmendmentService {

    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final ContactAmendmentRepository contactAmendmentRepository;
    private final ContactAmendmentMapper amendmentMapper;
    private final FcmNotificationService fcmNotificationService;
    private final EmailService emailService;

    private synchronized String generateAmendmentId() {
        int currentYear = Year.now().getValue();
        String prefix = "CA" + currentYear;
        Optional<String> maxIdOpt = contactAmendmentRepository.findMaxIdByPrefix(prefix);

        int nextSequence = 1;
        if (maxIdOpt.isPresent() && maxIdOpt.get() != null) {
            String maxId = maxIdOpt.get().trim();
            try {
                String seqPart = maxId.substring(prefix.length());
                nextSequence = Integer.parseInt(seqPart) + 1;
            } catch (Exception e) {
                log.warn("Failed to parse sequence from max ID [{}], defaulting to 1", maxId);
            }
        }

        return String.format("%s%04d", prefix, nextSequence);
    }

    private Customer resolveAndVerifyCustomer(String customerId, String gstId) {
        String resolvedCustId = null;

        if (customerId != null && !customerId.trim().isEmpty()) {
            resolvedCustId = customerId.trim();
        }

        if (resolvedCustId == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof JwtPrincipal principal) {
                resolvedCustId = principal.custId();
            } else if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                resolvedCustId = auth.getName();
            }
        }

        if (resolvedCustId == null && gstId != null && !gstId.trim().isEmpty()) {
            if (customerRepository.existsById(gstId.trim())) {
                resolvedCustId = gstId.trim();
            }
        }

        if (resolvedCustId == null || resolvedCustId.trim().isEmpty()) {
            throw new ResourceNotFoundException("Customer ID is required to submit amendment");
        }

        final String finalCustId = resolvedCustId;
        return customerRepository.findById(finalCustId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + finalCustId));
    }

    @Override
    public ContactAmendmentViewDto getExistingContactDetails(String gstId) {
        String lookupGst = gstId != null ? gstId.trim() : "";

        Optional<ContactAmendmentEntity> existingAmendment = contactAmendmentRepository.findByGstNumber(lookupGst);
        if (existingAmendment.isPresent()) {
            return amendmentMapper.toDto(existingAmendment.get());
        }

        Optional<Business> existingBusiness = businessRepository.findById(lookupGst);
        if (existingBusiness.isPresent()) {
            Business business = existingBusiness.get();
            return ContactAmendmentViewDto.builder()
                    .newMobileNumber(business.getSignatoryMobile())
                    .newEmail(business.getSignatoryEmail())
                    .businessGstId(business.getGstId())
                    .gstNumber(business.getGstId())
                    .build();
        }

        return ContactAmendmentViewDto.builder()
                .businessGstId(gstId)
                .gstNumber(gstId)
                .build();
    }

    @Override
    @Transactional
    public ContactAmendmentViewDto submitContactAmendment(String gstId, String customerId, String mobileNumber, String email, MultipartFile file) throws IOException {
        Customer customer = resolveAndVerifyCustomer(customerId, gstId);
        String gstNumber = gstId != null ? gstId.trim() : "";

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Supporting proof document is required for contact details amendment");
        }

        byte[] fileBytes = file.getBytes();

        ContactAmendmentViewDto inputDto = new ContactAmendmentViewDto();
        inputDto.setNewMobileNumber(mobileNumber);
        inputDto.setNewEmail(email);
        inputDto.setGstNumber(gstNumber);
        inputDto.setImageData(fileBytes);

        ContactAmendmentEntity amendment = amendmentMapper.toEntity(inputDto);
        amendment.setId(generateAmendmentId());
        amendment.setCustomer(customer);

        amendment = contactAmendmentRepository.save(amendment);

        return amendmentMapper.toDto(amendment);
    }

    @Override
    public ContactAmendmentViewDto getAmendmentById(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Amendment ID must not be null or empty");
        }
        ContactAmendmentEntity entity = contactAmendmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No contact amendment found with id: " + id));

        return amendmentMapper.toDto(entity);
    }

    @Override
    @Transactional
    public ContactAmendmentViewDto updateContactAmendment(String id, String mobileNumber, String email, MultipartFile file) throws IOException {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Amendment ID must not be null or empty");
        }
        ContactAmendmentEntity entity = contactAmendmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No contact amendment found with id: " + id));

        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) entity.setNewMobileNumber(mobileNumber);
        if (email != null && !email.trim().isEmpty()) entity.setNewEmail(email);
        if (file != null && !file.isEmpty()) {
            entity.setImageData(file.getBytes());
        }

        entity = contactAmendmentRepository.save(entity);

        return amendmentMapper.toDto(entity);
    }

    @Override
    @Transactional
    public String submitAmendment(String id, String gstId, String pushToken) {
        ContactAmendmentEntity amendment;

        if (id != null && !id.trim().isEmpty()) {
            amendment = contactAmendmentRepository.findById(id.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact amendment not found with id: " + id));
        } else if (gstId != null && !gstId.isBlank()) {
            String trimmedGst = gstId.trim();
            amendment = contactAmendmentRepository.findByGstNumber(trimmedGst)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact amendment not found for GST number: " + trimmedGst));
        } else {
            throw new IllegalArgumentException("Either id or gstId is required to submit amendment");
        }

        RegisterationStatus currentStatus = amendment.getStatus();
        if (currentStatus != null && currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
            throw new IllegalStateException(
                    "Contact amendment " + amendment.getId() + " cannot be submitted. Current status: " + currentStatus);
        }

        amendment.setStatus(RegisterationStatus.SUBMITTED);
        amendment.setSubmittedAt(LocalDateTime.now());
        contactAmendmentRepository.save(amendment);

        Customer customer = amendment.getCustomer();

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
                : amendment.getGstNumber();

        if (resolvedToken != null && !resolvedToken.isBlank() && fcmNotificationService != null) {
            try {
                fcmNotificationService.sendSuccessNotification(resolvedToken, applicantName);
            } catch (Exception ex) {
                log.error("Push notification failed for contact amendment id {}", amendment.getId(), ex);
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
            log.error("Confirmation email failed for contact amendment id {}", amendment.getId(), ex);
        }

        return "Contact amendment submitted successfully. Amendment ID: " + amendment.getId();
    }
}
