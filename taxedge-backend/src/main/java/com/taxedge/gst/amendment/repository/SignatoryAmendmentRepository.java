package com.taxedge.gst.amendment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;
import com.taxedge.gst.registration.enums.RegisterationStatus;

@Repository
public interface SignatoryAmendmentRepository extends JpaRepository<SignatoryAmendmentEntity, String> {

    @Query("SELECT MAX(s.id) FROM SignatoryAmendmentEntity s WHERE s.id LIKE CONCAT(:prefix, '%')")
    Optional<String> findMaxIdByPrefix(@Param("prefix") String prefix);

    Optional<SignatoryAmendmentEntity> findByGstNumber(String gstNumber);
    List<SignatoryAmendmentEntity> findByCustomerCustId(String custId);

    @Query("SELECT DISTINCT s FROM SignatoryAmendmentEntity s LEFT JOIN FETCH s.customer ORDER BY s.createdAt DESC")
    List<SignatoryAmendmentEntity> findAllWithCustomer();

    @Query("SELECT DISTINCT s FROM SignatoryAmendmentEntity s LEFT JOIN FETCH s.customer WHERE s.assignedAgent.id = :agentId ORDER BY s.createdAt DESC")
    List<SignatoryAmendmentEntity> findByAssignedAgentId(@Param("agentId") Long agentId);

    @Query("SELECT s FROM SignatoryAmendmentEntity s WHERE s.status = :status AND ((s.updatedAt IS NOT NULL AND s.updatedAt < :cutoff) OR (s.updatedAt IS NULL AND (s.createdAt < :cutoff OR s.createdAt IS NULL)))")
    List<SignatoryAmendmentEntity> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);
}
