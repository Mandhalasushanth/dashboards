package com.taxedge.notification.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushNotificationResponse {
    private boolean success;
    private String message;
    private String recipientMobileNumber;
    private String recipientName;
    private String messageId;
    private LocalDateTime timestamp;
}
