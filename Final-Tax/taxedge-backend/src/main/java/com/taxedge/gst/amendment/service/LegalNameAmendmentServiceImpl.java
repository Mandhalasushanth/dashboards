package com.taxedge.gst.amendment.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.Base64;
import java.util.Optional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.gst.amendment.dto.LegalNameAmendmentViewDto;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.mapper.LegalNameAmendmentMapper;
import com.taxedge.gst.amendment.repository.LegalNameAmendmentRepository;
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
public class LegalNameAmendmentServiceImpl implements LegalNameAmendmentService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final LegalNameAmendmentRepository amendmentRepository;
    private final LegalNameAmendmentMapper amendmentMapper;
    private final FcmNotificationService fcmNotificationService;
    private final EmailService emailService;

    private synchronized String generateAmendmentId() {
        int currentYear = Year.now().getValue();
        String prefix = "LNA" + currentYear;
        Optional<String> maxIdOpt = amendmentRepository.findMaxIdByPrefix(prefix);

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

    private void validateDocumentFile(MultipartFile file, String contextInfo) {
        if (file == null || file.isEmpty()) {
            log.warn("Document file is missing or empty for {}", contextInfo);
            throw new IllegalArgumentException("Supporting proof document is required for legal name amendment");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            log.warn("File size {} exceeds limit of {} bytes for {}", file.getSize(), MAX_FILE_SIZE_BYTES, contextInfo);
            throw new IllegalArgumentException("Supporting proof document size must not exceed 10 MB");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/") && !contentType.equalsIgnoreCase("application/pdf")) {
            log.warn("Invalid file content type '{}' for {}", contentType, contextInfo);
            throw new IllegalArgumentException("Supporting document must be a valid image (JPEG, PNG, WEBP) or PDF file");
        }
    }

    @Override
    public LegalNameAmendmentViewDto getExistingLegalNameDetails(String gstId) {
        if (gstId == null || gstId.trim().isEmpty()) {
            throw new IllegalArgumentException("GST Number must not be blank");
        }
        String sanitizedGstId = gstId.trim();
        Optional<Business> businessOpt = businessRepository.findById(sanitizedGstId);
        String existingName = businessOpt.map(Business::getLegalName).orElse("");

        return LegalNameAmendmentViewDto.builder()
                .newLegalName(existingName)
                .businessGstId(sanitizedGstId)
                .gstNumber(sanitizedGstId)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LegalNameAmendmentViewDto submitLegalNameAmendment(String gstId, String customerId, String newLegalName, MultipartFile file) throws IOException {
        if (gstId == null || gstId.trim().isEmpty()) {
            log.warn("Rejecting legal name amendment: GST ID/Number is blank");
            throw new IllegalArgumentException("GST Number is required to submit legal name amendment");
        }

        if (newLegalName == null || newLegalName.trim().isEmpty()) {
            log.warn("Rejecting legal name amendment for GST {}: new legal name is blank", gstId);
            throw new IllegalArgumentException("New legal name is required for amendment");
        }

        String sanitizedGstNumber = gstId.trim();
        String sanitizedNewLegalName = newLegalName.trim();

        validateDocumentFile(file, "GST " + sanitizedGstNumber);

        Customer customer = resolveAndVerifyCustomer(customerId, sanitizedGstNumber);

        log.info("Submitting legal name amendment: GST={}, CustomerId={}, NewLegalName='{}'",
                sanitizedGstNumber, customer.getCustId(), sanitizedNewLegalName);

        byte[] fileBytes = file.getBytes();

        LegalNameAmendmentViewDto inputDto = new LegalNameAmendmentViewDto();
        inputDto.setNewLegalName(sanitizedNewLegalName);
        inputDto.setGstNumber(sanitizedGstNumber);
        inputDto.setImageData(fileBytes);

        LegalNameAmendmentEntity amendment = amendmentMapper.toEntity(inputDto);
        amendment.setId(generateAmendmentId());
        amendment.setCustomer(customer);

        amendment = amendmentRepository.save(amendment);
        log.info("Successfully persisted legal name amendment with ID: {} for GST: {}", amendment.getId(), sanitizedGstNumber);

        return amendmentMapper.toDto(amendment);
    }

    @Override
    public LegalNameAmendmentViewDto getAmendmentById(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Amendment ID must not be null or empty");
        }
        LegalNameAmendmentEntity entity = amendmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No legal name amendment found with id: " + id));

        return amendmentMapper.toDto(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LegalNameAmendmentViewDto updateLegalNameAmendment(String id, String newLegalName, MultipartFile file) throws IOException {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Amendment ID must not be null or empty");
        }
        LegalNameAmendmentEntity entity = amendmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No legal name amendment found with id: " + id));

        if (newLegalName != null && !newLegalName.trim().isEmpty()) {
            entity.setNewLegalName(newLegalName.trim());
        }

        if (file != null && !file.isEmpty()) {
            validateDocumentFile(file, "Amendment update id " + id);
            entity.setImageData(file.getBytes());
        }

        entity = amendmentRepository.save(entity);
        log.info("Successfully updated legal name amendment [id: {}]", id);

        return amendmentMapper.toDto(entity);
    }

    @Override
    @Transactional
    public String submitAmendment(String id, String gstId, String pushToken) {
        LegalNameAmendmentEntity amendment;

        if (id != null && !id.trim().isEmpty()) {
            amendment = amendmentRepository.findById(id.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Legal name amendment not found with id: " + id));
        } else if (gstId != null && !gstId.isBlank()) {
            String trimmedGst = gstId.trim();
            amendment = amendmentRepository.findByGstNumber(trimmedGst)
                    .orElseThrow(() -> new ResourceNotFoundException("Legal name amendment not found for GST number: " + trimmedGst));
        } else {
            throw new IllegalArgumentException("Either id or gstId is required to submit amendment");
        }

        RegisterationStatus currentStatus = amendment.getStatus();
        if (currentStatus != null && currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
            throw new IllegalStateException(
                    "Legal name amendment " + amendment.getId() + " cannot be submitted. Current status: " + currentStatus);
        }

        amendment.setStatus(RegisterationStatus.SUBMITTED);
        amendment.setSubmittedAt(LocalDateTime.now());
        amendmentRepository.save(amendment);

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
                log.error("Push notification failed for legal name amendment id {}", amendment.getId(), ex);
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
            log.error("Confirmation email failed for legal name amendment id {}", amendment.getId(), ex);
        }

        return "Legal name amendment submitted successfully. Amendment ID: " + amendment.getId();
    }
}
