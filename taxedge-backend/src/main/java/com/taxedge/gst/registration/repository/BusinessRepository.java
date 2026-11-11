package com.taxedge.gst.registration.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxedge.gst.registration.entity.Business;
import com.taxedge.gst.registration.enums.RegisterationStatus;

public interface BusinessRepository extends JpaRepository<Business, String> {

	List<Business> findByCustomer_CustId(String custId);

	@Query("SELECT DISTINCT b FROM Business b LEFT JOIN FETCH b.documents LEFT JOIN FETCH b.customer ORDER BY b.createdAt DESC")
	List<Business> findAllWithDocuments();

	@Query("SELECT DISTINCT b FROM Business b LEFT JOIN FETCH b.documents LEFT JOIN FETCH b.customer WHERE b.assignedAgent.id = :agentId ORDER BY b.createdAt DESC")
	List<Business> findByAssignedAgentId(@Param("agentId") Long agentId);

	@Query("SELECT b FROM Business b WHERE b.status = :status AND ((b.updatedAt IS NOT NULL AND b.updatedAt < :cutoff) OR (b.updatedAt IS NULL AND (b.createdAt < :cutoff OR b.createdAt IS NULL)))")
	List<Business> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

	@Query("SELECT b FROM Business b LEFT JOIN FETCH b.documents LEFT JOIN FETCH b.customer " +
	       "WHERE b.customer.custId = :custId AND b.status != RegisterationStatus.DRAFT " +
	       "ORDER BY b.createdAt DESC")
	List<Business> findSubmittedByCustId(@Param("custId") String custId);
}
