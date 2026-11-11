package com.taxedge.notification.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.google.api.core.ApiFuture;
import com.google.api.core.ApiFutures;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.taxedge.customer.repository.CustomerRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationServiceImpl implements FcmNotificationService {

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final CustomerRepository customerRepository;

    @Override
    public void sendRegistrationSuccessNotification(String targetDeviceToken, String userName) {
        if (targetDeviceToken == null || targetDeviceToken.trim().isEmpty()) {
            log.warn("No push token found for user. Skipping notification.");
            return;
        }

        String title = "Registration Successful";
        String body = "Registration successful";

        if (isExpoPushToken(targetDeviceToken)) {
            sendExpoPushNotification(targetDeviceToken, title, body, "REGISTRATION_SUCCESS");
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(targetDeviceToken)
                    .setNotification(notification)
                    .putData("type", "REGISTRATION_SUCCESS")
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM Push Notification sent successfully. Message ID: {}", response);
        } catch (Exception e) {
            log.error("Error sending FCM notification: {}", e.getMessage(), e);
        }
    }

    @Override
    public void sendSuccessNotification(String targetDeviceToken, String userName) {
        sendRegistrationSuccessNotification(targetDeviceToken, userName);
    }

    @Override
    public String sendCustomNotification(String targetDeviceToken, String title, String body) {
        if (targetDeviceToken == null || targetDeviceToken.trim().isEmpty()) {
            log.warn("No push token provided. Skipping notification.");
            return null;
        }

        if (isExpoPushToken(targetDeviceToken)) {
            sendExpoPushNotification(targetDeviceToken, title, body, "ADMIN_NOTIFICATION");
            return "EXPO_DISPATCHED";
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(targetDeviceToken)
                    .setNotification(notification)
                    .putData("type", "ADMIN_NOTIFICATION")
                    .build();

            String messageId = FirebaseMessaging.getInstance().send(message);
            log.info("Custom FCM notification sent. Message ID: {}", messageId);
            return messageId;

        } catch (Exception e) {
            log.error("Error sending custom FCM notification: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public int countRegisteredDevices() {
        return customerRepository.findAllPushTokens().size();
    }

    @Async("mailExecutor")
    @Override
    public void sendBroadcast(String title, String body) {

        List<String> tokens = customerRepository.findAllPushTokens();
        if (tokens.isEmpty()) {
            log.info("Broadcast skipped: no registered devices.");
            return;
        }

        Map<Boolean, List<String>> split = tokens.stream()
                .collect(Collectors.partitioningBy(this::isExpoPushToken));

        List<String> expoTokens = split.get(true);
        List<String> fcmTokens = split.get(false);

        log.info("Broadcast starting. FCM: {}, Expo: {}", fcmTokens.size(), expoTokens.size());

        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        List<List<String>> fcmBatches = partition(fcmTokens, 500);

        List<ApiFuture<BatchResponse>> futures = fcmBatches.stream()
                .map(batch -> FirebaseMessaging.getInstance().sendEachForMulticastAsync(
                        MulticastMessage.builder()
                                .addAllTokens(batch)
                                .setNotification(notification)
                                .putData("type", "BROADCAST")
                                .build()))
                .toList();

        List<CompletableFuture<HttpResponse<String>>> expoFutures = partition(expoTokens, 100).stream()
                .map(batch -> sendExpoBatchAsync(batch, title, body))
                .toList();

        try {
            List<BatchResponse> results = ApiFutures.allAsList(futures).get(2, TimeUnit.MINUTES);

            int sent = results.stream().mapToInt(BatchResponse::getSuccessCount).sum();
            int failed = results.stream().mapToInt(BatchResponse::getFailureCount).sum();

            IntStream.range(0, results.size())
                     .forEach(i -> cleanupDeadTokens(fcmBatches.get(i), results.get(i)));

            CompletableFuture.allOf(expoFutures.toArray(CompletableFuture[]::new))
                             .get(2, TimeUnit.MINUTES);

            log.info("Broadcast finished. Sent: {}, Failed: {}", sent, failed);

        } catch (Exception ex) {
            log.error("Broadcast did not complete cleanly: {}", ex.getMessage(), ex);
        }
    }

    private void cleanupDeadTokens(List<String> batch, BatchResponse response) {
        IntStream.range(0, response.getResponses().size())
                 .filter(i -> !response.getResponses().get(i).isSuccessful())
                 .filter(i -> {
                     if (response.getResponses().get(i).getException() == null) {
                         return false;
                     }
                     MessagingErrorCode code = response.getResponses().get(i)
                             .getException().getMessagingErrorCode();
                     return code == MessagingErrorCode.UNREGISTERED
                         || code == MessagingErrorCode.INVALID_ARGUMENT;
                 })
                 .forEach(i -> customerRepository.clearPushToken(batch.get(i)));
    }

    private CompletableFuture<HttpResponse<String>> sendExpoBatchAsync(
            List<String> tokens, String title, String body) {
        try {
            String messages = tokens.stream()
                    .map(token -> String.format(
                            "{\"to\":\"%s\",\"title\":\"%s\",\"body\":\"%s\",\"sound\":\"default\",\"priority\":\"high\",\"data\":{\"type\":\"BROADCAST\"}}",
                            escape(token), escape(title), escape(body)))
                    .collect(Collectors.joining(",", "[", "]"));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://exp.host/--/api/v2/push/send"))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(messages, StandardCharsets.UTF_8))
                    .build();

            return HTTP_CLIENT.sendAsync(request, HttpResponse.BodyHandlers.ofString());

        } catch (Exception ex) {
            log.error("Expo batch build failed: {}", ex.getMessage(), ex);
            return CompletableFuture.completedFuture(null);
        }
    }

    private static List<List<String>> partition(List<String> source, int size) {
        return IntStream.range(0, (source.size() + size - 1) / size)
                .mapToObj(i -> source.subList(i * size, Math.min((i + 1) * size, source.size())))
                .toList();
    }

    private static String escape(String value) {
        return value == null ? "" : value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private boolean isExpoPushToken(String token) {
        return token != null && (token.startsWith("ExponentPushToken") || token.startsWith("ExpoPushToken") || token.contains("dev-"));
    }

    private void sendExpoPushNotification(String expoPushToken, String title, String body, String type) {
        try {
            String jsonPayload = String.format(
                "{\"to\":\"%s\",\"title\":\"%s\",\"body\":\"%s\",\"sound\":\"default\",\"priority\":\"high\",\"data\":{\"type\":\"%s\"}}",
                escape(expoPushToken), escape(title), escape(body), escape(type)
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://exp.host/--/api/v2/push/send"))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("Backend Expo Push Notification response: {}", response.body());
        } catch (Exception ex) {
            log.error("Error dispatching Expo Push Notification from backend: {}", ex.getMessage(), ex);
        }
    }

}
