package com.taxedge.gst.amendment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.registration.enums.RegisterationStatus;

@Repository
public interface PrincipalPlaceAmendmentRepository extends JpaRepository<PrincipalPlaceAmendmentEntity, String> {

    Optional<PrincipalPlaceAmendmentEntity> findByGstNumber(String gstNumber);
    List<PrincipalPlaceAmendmentEntity> findByCustomerCustId(String custId);

    @Query("SELECT DISTINCT p FROM PrincipalPlaceAmendmentEntity p LEFT JOIN FETCH p.customer ORDER BY p.createdAt DESC")
    List<PrincipalPlaceAmendmentEntity> findAllWithCustomer();

    @Query("SELECT DISTINCT p FROM PrincipalPlaceAmendmentEntity p LEFT JOIN FETCH p.customer WHERE p.assignedAgent.id = :agentId ORDER BY p.createdAt DESC")
    List<PrincipalPlaceAmendmentEntity> findByAssignedAgentId(@Param("agentId") Long agentId);

    @Query("SELECT p FROM PrincipalPlaceAmendmentEntity p WHERE p.status = :status AND ((p.updatedAt IS NOT NULL AND p.updatedAt < :cutoff) OR (p.updatedAt IS NULL AND (p.createdAt < :cutoff OR p.createdAt IS NULL)))")
    List<PrincipalPlaceAmendmentEntity> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT MAX(p.id) FROM PrincipalPlaceAmendmentEntity p WHERE p.id LIKE CONCAT(:prefix, '%')")
    Optional<String> findMaxIdByPrefix(@Param("prefix") String prefix);
}
