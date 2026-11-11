package com.taxedge.gst.compliance.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxedge.gst.compliance.entity.GstCompliance;
import com.taxedge.gst.registration.enums.RegisterationStatus;

public interface GstComplianceRepository extends JpaRepository<GstCompliance, String> {

	List<GstCompliance> findByGstin(String gstin);

	Optional<GstCompliance> findByComplinaceIdAndGstin(String complinaceId, String gstin);

	@Query("SELECT c FROM GstCompliance c LEFT JOIN FETCH c.customer ORDER BY c.createdAt DESC")
	List<GstCompliance> findAllWithCustomer();

	@Query("SELECT c FROM GstCompliance c LEFT JOIN FETCH c.customer WHERE c.assignedAgent.id = :agentId ORDER BY c.createdAt DESC")
	List<GstCompliance> findByAssignedAgentId(@Param("agentId") Long agentId);

	@Query("SELECT c FROM GstCompliance c WHERE c.status = :status AND ((c.updatedAt IS NOT NULL AND c.updatedAt < :cutoff) OR (c.updatedAt IS NULL AND (c.createdAt < :cutoff OR c.createdAt IS NULL)))")
	List<GstCompliance> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

	@Query("SELECT c FROM GstCompliance c LEFT JOIN FETCH c.customer " +
	       "WHERE c.customer.custId = :custId AND c.status != RegisterationStatus.DRAFT " +
	       "ORDER BY c.createdAt DESC")
	List<GstCompliance> findSubmittedByCustId(@Param("custId") String custId);
}
