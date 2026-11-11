
package com.taxedge.loan.homeloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.homeloan.entity.HomeLoanDocument;

@Repository
public interface HomeLoanDocumentRepository
        extends JpaRepository<HomeLoanDocument, String> {

    Optional<HomeLoanDocument> findByHomeLoanApplication_HomeLoanId(
            String homeLoanId);
}
