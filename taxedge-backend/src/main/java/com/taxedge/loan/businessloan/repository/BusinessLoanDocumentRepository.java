package com.taxedge.loan.businessloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.businessloan.entity.BusinessLoanDocument;

@Repository
public interface BusinessLoanDocumentRepository extends JpaRepository<BusinessLoanDocument, String> {

    Optional<BusinessLoanDocument> findByLoanApplication_Id(String loanApplicationId);

    boolean existsByLoanApplication_Id(String loanApplicationId);

    void deleteByLoanApplication_Id(String loanApplicationId);

    @Query(value = """
            SELECT pan_card_file_name AS "panCardFileName",
                   pan_card_content_type AS "panCardContentType",
                   octet_length(pan_card_file) AS "panCardFileSize",
                   business_registration_file_name AS "businessRegistrationFileName",
                   business_registration_content_type AS "businessRegistrationContentType",
                   octet_length(business_registration_proof_file) AS "businessRegistrationFileSize",
                   bank_statements_file_name AS "bankStatementsFileName",
                   bank_statements_content_type AS "bankStatementsContentType",
                   octet_length(bank_statements_file) AS "bankStatementsFileSize",
                   business_expansion_file_name AS "businessExpansionFileName",
                   business_expansion_content_type AS "businessExpansionContentType",
                   octet_length(business_expansion_document_file) AS "businessExpansionFileSize",
                   gst_certificate_file_name AS "gstCertificateFileName",
                   gst_certificate_content_type AS "gstCertificateContentType",
                   octet_length(gst_certificate_file) AS "gstCertificateFileSize",
                   profit_loss_statement_file_name AS "financialStatementsFileName",
                   profit_loss_statement_content_type AS "financialStatementsContentType",
                   octet_length(profit_loss_statement_file) AS "financialStatementsFileSize"
            FROM business_loan_documents
            WHERE loan_application_id = :loanApplicationId
            """, nativeQuery = true)
    java.util.Optional<BusinessLoanDocumentMetadataProjection> findDraftDocumentMetadataByLoanApplicationId(
            @Param("loanApplicationId") String loanApplicationId);
}
