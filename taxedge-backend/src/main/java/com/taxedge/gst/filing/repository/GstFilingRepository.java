package com.taxedge.gst.filing.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.enums.ReturnType;
import com.taxedge.gst.registration.enums.RegisterationStatus;

public interface GstFilingRepository extends JpaRepository<GstFiling, String> {

	List<GstFiling> findByGstin(String gstin);

	List<GstFiling> findByCustomer_CustId(String customerId);

	Optional<GstFiling> findByGstfilingIdAndGstin(String gstfilingId, String gstin);

	boolean existsByGstinAndFinancialYearAndFilingPeriodAndReturnType(String gstin, String financialYear,
			String filingPeriod, ReturnType returnType);

	@Query("SELECT DISTINCT f FROM GstFiling f LEFT JOIN FETCH f.documents LEFT JOIN FETCH f.customer ORDER BY f.createdAt DESC")
	List<GstFiling> findAllWithDocuments();

	@Query("SELECT DISTINCT f FROM GstFiling f LEFT JOIN FETCH f.documents LEFT JOIN FETCH f.customer WHERE f.assignedAgent.id = :agentId ORDER BY f.createdAt DESC")
	List<GstFiling> findByAssignedAgentId(@Param("agentId") Long agentId);

	@Query("SELECT f FROM GstFiling f WHERE f.status = :status AND ((f.updatedAt IS NOT NULL AND f.updatedAt < :cutoff) OR (f.updatedAt IS NULL AND (f.createdAt < :cutoff OR f.createdAt IS NULL)))")
	List<GstFiling> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

	@Query("SELECT f FROM GstFiling f LEFT JOIN FETCH f.documents LEFT JOIN FETCH f.customer " +
	       "WHERE f.customer.custId = :custId AND f.status != RegisterationStatus.DRAFT " +
	       "ORDER BY f.createdAt DESC")
	List<GstFiling> findSubmittedByCustId(@Param("custId") String custId);
}
