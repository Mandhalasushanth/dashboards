package com.taxedge.loan.businessloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.loan.businessloan.entity.BusinessLoanBanking;

public interface BusinessLoanBankingRepository extends JpaRepository<BusinessLoanBanking, Long> {

    Optional<BusinessLoanBanking> findByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);
}
