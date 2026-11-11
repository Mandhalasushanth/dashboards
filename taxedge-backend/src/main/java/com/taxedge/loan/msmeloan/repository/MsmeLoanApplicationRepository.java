package com.taxedge.loan.msmeloan.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.msmeloan.entity.MsmeLoanApplication;

public interface MsmeLoanApplicationRepository extends JpaRepository<MsmeLoanApplication, String> {

    List<MsmeLoanApplication> findByCustomer_CustIdOrderByCreatedAtDesc(String customerId);

    Optional<MsmeLoanApplication> findByIdAndCustomer_CustId(String id, String customerId);
}
