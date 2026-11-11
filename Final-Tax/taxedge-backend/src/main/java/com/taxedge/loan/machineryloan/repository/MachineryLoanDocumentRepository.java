package com.taxedge.loan.machineryloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.machineryloan.entity.MachineryLoanDocument;

@Repository
public interface MachineryLoanDocumentRepository extends JpaRepository<MachineryLoanDocument, String> {

    Optional<MachineryLoanDocument> findByMachineryLoanApplication_Id(String machineryLoanId);

    boolean existsByMachineryLoanApplication_Id(String machineryLoanId);

    void deleteByMachineryLoanApplication_Id(String machineryLoanId);
}
