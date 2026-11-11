package com.taxedge.messaging.service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.taxedge.messaging.dto.MessageDto;
import com.taxedge.messaging.entity.Message;
import com.taxedge.messaging.enums.ChannelType;
import com.taxedge.messaging.enums.MessageType;
import com.taxedge.messaging.mapper.MessageMapper;
import com.taxedge.messaging.repository.MessageRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private static final String USER_QUEUE = "/queue/messages";
    private static final int MAX_PAGE_SIZE = 100;
    private static final int DEFAULT_PAGE_SIZE = 50;

    private final MessageRepository messageRepository;
    private final MessageMapper messageMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public MessageDto saveMessage(MessageDto dto, Principal sender) {

        String senderId = sender.getName();
        String recipientId = dto.getRecipientId();

        ChannelType channelType;
        String adminId = null;
        String custId = null;
        String managerId = null;
        String agentId = null;

        if (isAdmin(senderId) || isAdmin(recipientId)) {
            adminId = isAdmin(senderId) ? senderId : recipientId;
            String otherId = isAdmin(senderId) ? recipientId : senderId;

            if (isAgent(otherId)) {
                channelType = ChannelType.ADMIN_AGENT;
                agentId = otherId;
            } else {
                channelType = ChannelType.ADMIN_MANAGER;
                managerId = otherId;
            }

        } else if (isCustomer(senderId) || isCustomer(recipientId)) {
            channelType = ChannelType.CUSTOMER_MANAGER;
            custId = isCustomer(senderId) ? senderId : recipientId;
            managerId = isCustomer(senderId) ? recipientId : senderId;

        } else {
            channelType = ChannelType.MANAGER_AGENT;
            boolean senderIsManager = isManager(senderId) || isAgent(recipientId);
            managerId = senderIsManager ? senderId : recipientId;
            agentId   = senderIsManager ? recipientId : senderId;
        }

        Message message = Message.builder()
                .adminId(adminId)
                .custId(custId)
                .managerId(managerId)
                .agentId(agentId)
                .channelType(channelType)
                .recipientId(recipientId)
                .clientMessageId(dto.getClientMessageId())
                .senderId(senderId)
                .senderName(dto.getSenderName())
                .messageType(dto.getMessageType() == null ? MessageType.TEXT : dto.getMessageType())
                .content(dto.getContent())
                .attachmentKey(dto.getAttachmentKey())
                .attachmentName(dto.getAttachmentName())
                .attachmentMime(dto.getAttachmentMime())
                .build();

        MessageDto saved;
        try {
            saved = messageMapper.toDto(messageRepository.save(message));

        } catch (DataIntegrityViolationException ex) {
            // Same clientMessageId already stored — a retry after a dropped connection.
            saved = messageMapper.toDto(messageRepository
                    .findBySenderIdAndClientMessageId(senderId, dto.getClientMessageId())
                    .orElseThrow(() -> ex));
        }

        saved.setRecipientId(recipientId);

        // Real-time dispatch to the recipient's private WebSocket queue
        messagingTemplate.convertAndSendToUser(recipientId, USER_QUEUE, saved);

        return saved;
    }

    @Override
    public List<MessageDto> getConversation(String partnerId, int page, int size) {

        String currentUserId = currentUserId();
        int pageSize = (size <= 0) ? DEFAULT_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
        PageRequest pageRequest = PageRequest.of(Math.max(page, 0), pageSize);

        List<Message> rows;

        if (isAdmin(currentUserId) || isAdmin(partnerId)) {
            String adminId = isAdmin(currentUserId) ? currentUserId : partnerId;
            String otherId = isAdmin(currentUserId) ? partnerId : currentUserId;

            if (isAgent(otherId)) {
                rows = messageRepository.findByAdminIdAndAgentIdOrderByIdDesc(adminId, otherId, pageRequest);
            } else {
                rows = messageRepository.findByAdminIdAndManagerIdOrderByIdDesc(adminId, otherId, pageRequest);
            }

        } else if (isCustomer(currentUserId) || isCustomer(partnerId)) {
            String custId = isCustomer(currentUserId) ? currentUserId : partnerId;
            String managerId = isCustomer(currentUserId) ? partnerId : currentUserId;
            rows = messageRepository.findByCustIdAndManagerIdOrderByIdDesc(custId, managerId, pageRequest);

        } else {
            String managerId = isManager(currentUserId) ? currentUserId : partnerId;
            String agentId   = isManager(currentUserId) ? partnerId : currentUserId;
            rows = messageRepository.findByManagerIdAndAgentIdOrderByIdDesc(managerId, agentId, pageRequest);
        }

        List<MessageDto> messages = new ArrayList<>(messageMapper.toDtoList(rows));
        Collections.reverse(messages);

        return messages;
    }

    private boolean isAdmin(String id) {
        return id != null && (id.toUpperCase().contains("ADMIN") || id.toUpperCase().startsWith("ADM"));
    }

    private boolean isCustomer(String id) {
        return id != null && id.startsWith("CI");
    }

    private boolean isManager(String id) {
        return id != null && (id.toUpperCase().contains("MANAGER") || id.toUpperCase().startsWith("CAM"));
    }

    private boolean isAgent(String id) {
        return id != null && (id.toUpperCase().contains("AGENT") || id.toUpperCase().startsWith("AGT"));
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            throw new IllegalStateException("No authenticated user in context");
        }
        return authentication.getName();
    }
}
