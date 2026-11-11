package com.taxedge.loan.businessloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.businessloan.entity.BusinessLoanProfile;

public interface BusinessLoanProfileRepository extends JpaRepository<BusinessLoanProfile, Long> {

    Optional<BusinessLoanProfile> findByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);
}
