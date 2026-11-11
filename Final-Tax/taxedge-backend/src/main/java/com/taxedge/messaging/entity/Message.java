package com.taxedge.messaging.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.taxedge.messaging.converter.MessageEncryptionConverter;
import com.taxedge.messaging.enums.ChannelType;
import com.taxedge.messaging.enums.MessageType;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "chat_messages",
    indexes = {
        @Index(name = "idx_msg_cust_mgr_id", columnList = "cust_id, manager_id, id"),
        @Index(name = "idx_msg_mgr_agent_id", columnList = "manager_id, agent_id, id"),
        @Index(name = "idx_msg_admin_mgr_id", columnList = "admin_id, manager_id, id"),
        @Index(name = "idx_msg_admin_agent_id", columnList = "admin_id, agent_id, id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_msg_sender_client_id", columnNames = {"sender_id", "client_message_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chat_message_seq")
    @SequenceGenerator(name = "chat_message_seq", sequenceName = "chat_message_seq", allocationSize = 50)
    @Column(name = "id")
    private Long id;

    @Column(name = "admin_id", length = 50, updatable = false)
    private String adminId;

    @Column(name = "cust_id", length = 50, updatable = false)
    private String custId;

    @Column(name = "manager_id", length = 50, updatable = false)
    private String managerId;

    @Column(name = "agent_id", length = 50, updatable = false)
    private String agentId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "channel_type", length = 30, nullable = false, updatable = false)
    private ChannelType channelType = ChannelType.CUSTOMER_MANAGER;

    @Column(name = "recipient_id", length = 50, nullable = false, updatable = false)
    private String recipientId;

    @Column(name = "client_message_id", length = 64, nullable = false, updatable = false)
    private String clientMessageId;

    @Column(name = "sender_id", length = 50, nullable = false, updatable = false)
    private String senderId;

    @Column(name = "sender_name", length = 100, updatable = false)
    private String senderName;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20, nullable = false, updatable = false)
    private MessageType messageType = MessageType.TEXT;

    @Convert(converter = MessageEncryptionConverter.class)
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachment_key", length = 500)
    private String attachmentKey;

    @Column(name = "attachment_name", length = 255)
    private String attachmentName;

    @Column(name = "attachment_mime", length = 100)
    private String attachmentMime;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}
