package com.taxedge.messaging.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.messaging.dto.MessageDto;
import com.taxedge.messaging.service.MessageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;

    @MessageMapping("/chat.send")
    @SendToUser("/queue/messages")
    public MessageDto send(@Payload MessageDto dto, Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Unauthorized: sender principal is missing");
        }
        if (dto.getRecipientId() == null || dto.getRecipientId().isBlank()) {
            throw new IllegalArgumentException("Recipient ID is required");
        }
        return messageService.saveMessage(dto, principal);
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleMessageError(Exception ex) {
        log.warn("Chat message rejected: {}", ex.getMessage());
        return "Message could not be sent: " + ex.getMessage();
    }

    @GetMapping("/history/{partnerId}")
    public ResponseEntity<List<MessageDto>> history(
            @PathVariable String partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        return ResponseEntity.ok(messageService.getConversation(partnerId, page, size));
    }
}
