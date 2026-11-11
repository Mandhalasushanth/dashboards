package com.taxedge.itr.tdsrefund.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.tdsrefund.dto.TdsRefundDto;
import com.taxedge.itr.tdsrefund.entity.TdsRefund;
import com.taxedge.itr.tdsrefund.mapper.TdsRefundMapper;
import com.taxedge.itr.tdsrefund.repository.TdsRefundRepository;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TdsRefundServiceImpl implements TdsRefundService {

    private final TdsRefundRepository repository;
    private final TdsRefundMapper mapper;
    private final CustomerRepository customerRepository;
    private final FcmNotificationService fcmNotificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    public String saveTds(TdsRefundDto dto) {

        String custId = currentCustomerId();

        TdsRefund entity = mapper.toEntity(dto);
        entity.setId("TDS" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase());
        entity.setCustId(custId);
        entity.setStatus(RegisterationStatus.DRAFT);
        entity.setCreatedAt(LocalDateTime.now());
        normalise(entity);

        String id = repository.save(entity).getId();
        log.info("TDS refund bank account created [{}] for customer [{}]", id, custId);
        return id;
    }

    @Override
    @Transactional
    public String updateTds(String id, TdsRefundDto dto) {

    	TdsRefund entity = findOrThrow(id);

        mapper.updateEntity(dto, entity);
        normalise(entity);

        log.info("TDS refund bank account updated [{}]", id);
        return entity.getId();
    }

    @Override
    public TdsRefundDto getTds(String id) {
        return mapper.toDto(findOrThrow(id));
    }

    @Override
    public TdsRefundDto getTdsByCustId(String custId) {

        requireSelf(custId);

        return repository.findByCustId(custId)
                .stream()
                .findFirst()
                .map(mapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No TDS refund bank account found for customer: " + custId));
    }

    @Override
    @Transactional
    public String submitTdsRefund(String id, String pushToken) {

        TdsRefund entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TDS refund record not found with ID: " + id));

        RegisterationStatus currentStatus = entity.getStatus();
        if (currentStatus == RegisterationStatus.SUBMITTED) {
            log.info("TDS refund {} is already submitted, treating as idempotent success", id);
            return "TDS refund submitted successfully. Refund ID: " + id;
        }
        if (currentStatus != null && currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
            throw new IllegalStateException(
                    "TDS refund " + id + " cannot be submitted. Current status: " + currentStatus);
        }

        entity.setStatus(RegisterationStatus.SUBMITTED);
        entity.setSubmittedAt(LocalDateTime.now());
        repository.save(entity);

        Customer customer = null;
        if (entity.getCustId() != null && !entity.getCustId().isBlank()) {
            customer = customerRepository.findById(entity.getCustId()).orElse(null);
        }

        // Save token if new or changed (tokens rotate)
        if (pushToken != null && !pushToken.isBlank() && customer != null && !pushToken.equals(customer.getPushToken())) {
            customer.setPushToken(pushToken);
            customerRepository.save(customer);
        }

        String resolvedToken = (pushToken != null && !pushToken.isBlank())
                ? pushToken
                : (customer != null ? customer.getPushToken() : null);

        String applicantName = (entity.getAccountHolderName() != null && !entity.getAccountHolderName().isBlank())
                ? entity.getAccountHolderName()
                : (entity.getLegalBusinessName() != null && !entity.getLegalBusinessName().isBlank()
                        ? entity.getLegalBusinessName()
                        : (customer != null && customer.getName() != null && !customer.getName().isBlank() ? customer.getName() : "Valued Customer"));

        // Push notification
        if (resolvedToken != null && !resolvedToken.isBlank() && fcmNotificationService != null) {
            try {
                fcmNotificationService.sendRegistrationSuccessNotification(resolvedToken, applicantName);
            } catch (Exception ex) {
                log.error("Push notification failed for TDS refund id {}", id, ex);
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
            log.error("Confirmation email failed for TDS refund id {}", id, ex);
        }

        return "TDS refund submitted successfully. Refund ID: " + id;
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated customer in context");
        }
        return authentication.getName();
    }

    private void requireSelf(String custId) {
        if (!currentCustomerId().equals(custId)) {
            log.warn("Customer [{}] attempted to read TDS refund data of [{}]", currentCustomerId(), custId);
            throw new ResourceNotFoundException("No TDS refund bank account found for customer: " + custId);
        }
    }

    private TdsRefund findOrThrow(String id) {
        return repository.findByIdAndCustId(id, currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("TDS refund bank account not found: " + id));
    }

    private void normalise(TdsRefund entity) {
        if (entity.getBusinessPan() != null) {
            entity.setBusinessPan(entity.getBusinessPan().trim().toUpperCase());
        }
        if (entity.getIfscCode() != null) {
            entity.setIfscCode(entity.getIfscCode().trim().toUpperCase());
        }
        if (entity.getAadhaarNumber() != null) {
            entity.setAadhaarNumber(entity.getAadhaarNumber().replaceAll("\\s+", ""));
        }
        if (entity.getMobileNumber() != null) {
            entity.setMobileNumber(entity.getMobileNumber().replaceAll("[^0-9]", ""));
        }
    }
}
