package com.taxedge.itr.filing.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.itr.filing.entity.ItrFiling;

@Repository
public interface ItrFilingRepository extends JpaRepository<ItrFiling, String> {

	@Query("SELECT DISTINCT i FROM ItrFiling i LEFT JOIN FETCH i.customer LEFT JOIN FETCH i.salaryIncome LEFT JOIN FETCH i.documents ORDER BY i.createdAt DESC")
	List<ItrFiling> findAllWithDetails();

	@Query("SELECT DISTINCT i FROM ItrFiling i LEFT JOIN FETCH i.customer LEFT JOIN FETCH i.salaryIncome LEFT JOIN FETCH i.documents WHERE i.assignedAgent.id = :agentId ORDER BY i.createdAt DESC")
	List<ItrFiling> findByAssignedAgentId(@Param("agentId") Long agentId);

	@Query("SELECT DISTINCT i FROM ItrFiling i LEFT JOIN FETCH i.customer LEFT JOIN FETCH i.salaryIncome LEFT JOIN FETCH i.documents WHERE i.customer.custId = :custId AND i.status != 'DRAFT' ORDER BY i.createdAt DESC")
	List<ItrFiling> findSubmittedByCustId(@Param("custId") String custId);

	@Query("SELECT i FROM ItrFiling i WHERE i.status = :status AND ((i.updatedAt IS NOT NULL AND i.updatedAt < :cutoff) OR (i.updatedAt IS NULL AND (i.createdAt < :cutoff OR i.createdAt IS NULL)))")
	List<ItrFiling> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);
}
