package com.taxedge.messaging.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.messaging.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // For Customer ↔ Manager threads
    List<Message> findByCustIdAndManagerIdOrderByIdDesc(String custId, String managerId, Pageable pageable);

    // For Manager ↔ Agent threads
    List<Message> findByManagerIdAndAgentIdOrderByIdDesc(String managerId, String agentId, Pageable pageable);

    // For Admin ↔ Manager threads
    List<Message> findByAdminIdAndManagerIdOrderByIdDesc(String adminId, String managerId, Pageable pageable);

    // For Admin ↔ Agent threads
    List<Message> findByAdminIdAndAgentIdOrderByIdDesc(String adminId, String agentId, Pageable pageable);

    // Unique message deduplication check
    Optional<Message> findBySenderIdAndClientMessageId(String senderId, String clientMessageId);
}
