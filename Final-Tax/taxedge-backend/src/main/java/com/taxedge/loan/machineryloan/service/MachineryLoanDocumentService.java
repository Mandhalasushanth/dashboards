package com.taxedge.loan.machineryloan.service;

import com.taxedge.loan.machineryloan.dto.MachineryLoanDocumentDto;

public interface MachineryLoanDocumentService {

    String saveDocuments(String machineryLoanId, MachineryLoanDocumentDto dto);

    String updateDocuments(String machineryLoanId, MachineryLoanDocumentDto dto);

    MachineryLoanDocumentDto getDocuments(String machineryLoanId);

    void deleteDocuments(String machineryLoanId);
}
