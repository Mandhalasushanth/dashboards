package com.taxedge.loan.homeloan.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxedge.loan.homeloan.entity.HomeLoanRequirementApplication;

public interface HomeLoanRequirementApplicationRepository
        extends JpaRepository<HomeLoanRequirementApplication, String> {

    java.util.List<HomeLoanRequirementApplication> findByCustomer_CustId(String custId);

    @Query(value = "SELECT nextval('home_loan_seq')", nativeQuery = true)
    Long getNextSequenceValue();
}
