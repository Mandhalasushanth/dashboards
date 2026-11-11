package com.taxedge.gst.amendment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.registration.enums.RegisterationStatus;

@Repository
public interface BankAccountAmendmentRepository extends JpaRepository<BankAccountAmendmentEntity, String> {

    Optional<BankAccountAmendmentEntity> findByGstNumber(String gstNumber);
    List<BankAccountAmendmentEntity> findByCustomerCustId(String custId);

    @Query("SELECT DISTINCT b FROM BankAccountAmendmentEntity b LEFT JOIN FETCH b.customer ORDER BY b.createdAt DESC")
    List<BankAccountAmendmentEntity> findAllWithCustomer();

    @Query("SELECT DISTINCT b FROM BankAccountAmendmentEntity b LEFT JOIN FETCH b.customer WHERE b.assignedAgent.id = :agentId ORDER BY b.createdAt DESC")
    List<BankAccountAmendmentEntity> findByAssignedAgentId(@Param("agentId") Long agentId);

    @Query("SELECT b FROM BankAccountAmendmentEntity b WHERE b.status = :status AND ((b.updatedAt IS NOT NULL AND b.updatedAt < :cutoff) OR (b.updatedAt IS NULL AND (b.createdAt < :cutoff OR b.createdAt IS NULL)))")
    List<BankAccountAmendmentEntity> findByStatusAndUpdatedAtBefore(@Param("status") RegisterationStatus status, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT MAX(b.id) FROM BankAccountAmendmentEntity b WHERE b.id LIKE CONCAT(:prefix, '%')")
    Optional<String> findMaxIdByPrefix(@Param("prefix") String prefix);
}
