package com.taxedge.loan.propertyloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.propertyloan.entity.PropertyLoanDocument;

@Repository
public interface PropertyLoanDocumentRepository extends JpaRepository<PropertyLoanDocument, String> {

    Optional<PropertyLoanDocument> findByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);
}
