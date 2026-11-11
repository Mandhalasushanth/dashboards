package com.taxedge.loan.businessloan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;

import com.taxedge.loan.businessloan.entity.BusinessLoanApplication;

@Repository
public interface BusinessLoanApplicationRepository
        extends JpaRepository<BusinessLoanApplication, String> {

    Optional<BusinessLoanApplication> findByIdAndCustomer_CustId(String id, String custId);

    List<BusinessLoanApplication> findByCustomer_CustIdOrderByCreatedAtDesc(String custId);

    Optional<BusinessLoanApplication> findFirstByCustomer_CustIdAndStatusOrderByLastActivityAtDesc(
            String custId, LoanApplicationStatus status);

    List<BusinessLoanApplication> findByStatusAndLastActivityAtBefore(
            LoanApplicationStatus status, java.time.LocalDateTime cutoff);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM BusinessLoanApplication a WHERE a.status = :status AND a.lastActivityAt < :cutoff")
    List<BusinessLoanApplication> findExpiredDraftsForCleanup(
            @Param("status") LoanApplicationStatus status,
            @Param("cutoff") java.time.LocalDateTime cutoff);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM BusinessLoanApplication a WHERE a.id = :id AND a.customer.custId = :custId")
    Optional<BusinessLoanApplication> findByIdAndCustomer_CustIdForUpdate(
            @Param("id") String id, @Param("custId") String custId);

    @Query(value = "SELECT nextval('business_loan_seq')", nativeQuery = true)
    Long getNextSequenceValue();
}
