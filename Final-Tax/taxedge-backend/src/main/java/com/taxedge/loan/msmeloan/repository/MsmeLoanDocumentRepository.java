package com.taxedge.loan.msmeloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.msmeloan.entity.MsmeLoanDocument;

@Repository
public interface MsmeLoanDocumentRepository extends JpaRepository<MsmeLoanDocument, String> {

    Optional<MsmeLoanDocument> findByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);
}
