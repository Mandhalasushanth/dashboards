package com.taxedge.loan.personalloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.personalloan.entity.PersonalLoanDocument;

@Repository
public interface PersonalLoanDocumentRepository extends JpaRepository<PersonalLoanDocument, String> {

    Optional<PersonalLoanDocument> findByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);
}
