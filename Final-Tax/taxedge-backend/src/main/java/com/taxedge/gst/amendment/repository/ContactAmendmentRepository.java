package com.taxedge.gst.amendment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.registration.enums.RegisterationStatus;

@Repository
public interface ContactAmendmentRepository extends JpaRepository<ContactAmendmentEntity, String> {

    Optional<ContactAmendmentEntity> findByGstNumber(String gstNumber);
    List<ContactAmendmentEntity> findByCustomerCustId(String custId);

    @Query("SELECT DISTINCT c FROM ContactAmendmentEntity c LEFT JOIN FETCH c.customer ORDER BY c.createdAt DESC")
    List<ContactAmendmentEntity> findAllWithCustomer();

    @Query("SELECT DISTINCT c FROM ContactAmendmentEntity c LEFT JOIN FETCH c.customer WHERE c.assignedAgent.id = :agentId ORDER BY c.createdAt DESC")
    List<ContactAmendmentEntity> findByAssignedAgentId(@Param("agentId") Long agentId);

    @Query("SELECT c FROM ContactAmendmentEntity c WHERE c.status = :status AND ((c.updatedAt IS NOT NULL AND c.updatedAt < :cutoff) OR (c.updatedAt IS NULL AND (c.createdAt < :cutoff OR c.createdAt IS NULL)))")
    List<ContactAmendmentEntity> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT MAX(c.id) FROM ContactAmendmentEntity c WHERE c.id LIKE CONCAT(:prefix, '%')")
    Optional<String> findMaxIdByPrefix(@Param("prefix") String prefix);
}
