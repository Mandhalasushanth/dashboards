package com.taxedge.notification.controller;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.notification.dto.AdminPushNotificationRequest;
import com.taxedge.notification.dto.BroadcastRequest;
import com.taxedge.notification.dto.BroadcastResponse;
import com.taxedge.notification.dto.PushNotificationResponse;
import com.taxedge.notification.service.FcmNotificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class AdminPushNotificationController {

    private final CustomerRepository customerRepository;
    private final FcmNotificationService fcmNotificationService;

    @PostMapping("/send")
    public ResponseEntity<PushNotificationResponse> sendNotification(
            @Valid @RequestBody AdminPushNotificationRequest request) {

        String mobileNumber = normaliseMobile(request.getMobileNumber());

        Customer customer = customerRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No customer found with mobile number: " + mobileNumber));

        String pushToken = customer.getPushToken();

        if (pushToken == null || pushToken.isBlank()) {
            log.warn("Push notification skipped: customer [{}] has no device token", customer.getCustId());
            return ResponseEntity.ok(PushNotificationResponse.builder()
                    .success(false)
                    .message("Customer has no registered device. They must open the app at least once.")
                    .recipientMobileNumber(mobileNumber)
                    .recipientName(customer.getName())
                    .timestamp(LocalDateTime.now())
                    .build());
        }

        String messageId = fcmNotificationService.sendCustomNotification(
                pushToken, request.getTitle(), request.getMessage());

        boolean success = messageId != null;

        log.info("Admin push notification to customer [{}]: success={}", customer.getCustId(), success);

        return ResponseEntity.ok(PushNotificationResponse.builder()
                .success(success)
                .message(success ? "Notification sent successfully" : "Notification dispatch failed")
                .recipientMobileNumber(mobileNumber)
                .recipientName(customer.getName())
                .messageId(messageId)
                .timestamp(LocalDateTime.now())
                .build());
    }

    private String normaliseMobile(String raw) {
        String digits = raw.replaceAll("[^0-9]", "");
        return digits.length() > 10 ? digits.substring(digits.length() - 10) : digits;
    }


    @PostMapping("/broadcast")
    public ResponseEntity<BroadcastResponse> broadcast(@Valid @RequestBody BroadcastRequest request) {

        int recipients = fcmNotificationService.countRegisteredDevices();

        fcmNotificationService.sendBroadcast(request.getTitle(), request.getMessage());

        return ResponseEntity.accepted().body(BroadcastResponse.builder()
                .accepted(true)
                .message("Broadcast dispatch started")
                .totalRecipients(recipients)
                .timestamp(LocalDateTime.now())
                .build());
    }
}