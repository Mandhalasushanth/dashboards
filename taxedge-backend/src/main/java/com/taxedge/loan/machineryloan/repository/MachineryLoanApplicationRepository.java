package com.taxedge.loan.machineryloan.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxedge.loan.machineryloan.entity.MachineryLoanApplication;

public interface MachineryLoanApplicationRepository
        extends JpaRepository<MachineryLoanApplication, String> {

    Optional<MachineryLoanApplication> findByIdAndCustomer_CustId(String id, String custId);

    List<MachineryLoanApplication> findByCustomer_CustIdOrderByCreatedAtDesc(String custId);

    @Query(value = "SELECT nextval('machinery_loan_seq')", nativeQuery = true)
    Long getNextSequenceValue();
}
