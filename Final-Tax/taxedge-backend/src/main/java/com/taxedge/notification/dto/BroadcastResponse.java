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
public class BroadcastResponse {
    private boolean accepted;
    private String message;
    private int totalRecipients;
    private LocalDateTime timestamp;
}