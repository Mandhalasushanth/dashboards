package com.taxedge.loan.businessloan.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.loan.businessloan.entity.BusinessLoanApplication;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;
import com.taxedge.loan.businessloan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanBankingRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanDocumentRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanProfileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessLoanDraftCleanupService {
    private final BusinessLoanApplicationRepository applicationRepository;
    private final BusinessLoanProfileRepository profileRepository;
    private final BusinessLoanBankingRepository bankingRepository;
    private final BusinessLoanDocumentRepository documentRepository;

    @Value("${taxedge.business-loan.draft-retention-days:21}")
    private int retentionDays;

    @Scheduled(fixedDelayString = "${taxedge.business-loan.draft-cleanup-interval-ms:3600000}")
    @Transactional
    public void cleanupExpiredDrafts() {
        LocalDateTime cutoff = LocalDateTime.now().minus(retentionDays, ChronoUnit.DAYS);
        List<BusinessLoanApplication> expiredDrafts = applicationRepository
                .findExpiredDraftsForCleanup(LoanApplicationStatus.DRAFT, cutoff);
        for (BusinessLoanApplication application : expiredDrafts) {
            documentRepository.deleteByLoanApplication_Id(application.getId());
            profileRepository.deleteByLoanApplication_Id(application.getId());
            bankingRepository.deleteByLoanApplication_Id(application.getId());
            applicationRepository.delete(application);
        }
        if (!expiredDrafts.isEmpty()) {
            log.info("Removed {} expired Business Loan drafts", expiredDrafts.size());
        }
    }
}
