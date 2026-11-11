package com.taxedge.gst.amendment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.registration.enums.RegisterationStatus;

@Repository
public interface LegalNameAmendmentRepository extends JpaRepository<LegalNameAmendmentEntity, String> {
    Optional<LegalNameAmendmentEntity> findByGstNumber(String gstNumber);
    List<LegalNameAmendmentEntity> findByCustomerCustId(String custId);

    @Query("SELECT DISTINCT l FROM LegalNameAmendmentEntity l LEFT JOIN FETCH l.customer ORDER BY l.createdAt DESC")
    List<LegalNameAmendmentEntity> findAllWithCustomer();

    @Query("SELECT DISTINCT l FROM LegalNameAmendmentEntity l LEFT JOIN FETCH l.customer WHERE l.assignedAgent.id = :agentId ORDER BY l.createdAt DESC")
    List<LegalNameAmendmentEntity> findByAssignedAgentId(@Param("agentId") Long agentId);

    @Query("SELECT l FROM LegalNameAmendmentEntity l WHERE l.status = :status AND ((l.updatedAt IS NOT NULL AND l.updatedAt < :cutoff) OR (l.updatedAt IS NULL AND (l.createdAt < :cutoff OR l.createdAt IS NULL)))")
    List<LegalNameAmendmentEntity> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT MAX(l.id) FROM LegalNameAmendmentEntity l WHERE l.id LIKE CONCAT(:prefix, '%')")
    Optional<String> findMaxIdByPrefix(@Param("prefix") String prefix);
}
