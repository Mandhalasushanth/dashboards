package com.taxedge.loan.propertyloan.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.propertyloan.entity.PropertyLoanApplication;

@Repository
public interface PropertyLoanApplicationRepository extends JpaRepository<PropertyLoanApplication, String> {

    Optional<PropertyLoanApplication> findByIdAndCustomer_CustId(String id, String custId);

    List<PropertyLoanApplication> findByCustomer_CustIdOrderByCreatedAtDesc(String custId);

    @Query(value = "SELECT nextval('property_loan_seq')", nativeQuery = true)
    Long getNextSequenceValue();
}
