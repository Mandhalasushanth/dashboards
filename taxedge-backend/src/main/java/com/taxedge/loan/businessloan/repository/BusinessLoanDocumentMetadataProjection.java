package com.taxedge.loan.businessloan.repository;

public interface BusinessLoanDocumentMetadataProjection {
    String getPanCardFileName();
    String getPanCardContentType();
    Integer getPanCardFileSize();
    String getBusinessRegistrationFileName();
    String getBusinessRegistrationContentType();
    Integer getBusinessRegistrationFileSize();
    String getBankStatementsFileName();
    String getBankStatementsContentType();
    Integer getBankStatementsFileSize();
    String getBusinessExpansionFileName();
    String getBusinessExpansionContentType();
    Integer getBusinessExpansionFileSize();
    String getGstCertificateFileName();
    String getGstCertificateContentType();
    Integer getGstCertificateFileSize();
    String getFinancialStatementsFileName();
    String getFinancialStatementsContentType();
    Integer getFinancialStatementsFileSize();
}
