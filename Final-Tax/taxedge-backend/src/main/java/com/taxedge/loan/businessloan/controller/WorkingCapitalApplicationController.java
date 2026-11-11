package com.taxedge.loan.businessloan.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.loan.businessloan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.businessloan.enums.LoanPurpose;
import com.taxedge.loan.businessloan.service.BusinessLoanApplicationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/working-capital")
@RequiredArgsConstructor
public class WorkingCapitalApplicationController {

    private final BusinessLoanApplicationService service;

    @PostMapping("/application")
    public ResponseEntity<String> saveApplication(
            @RequestBody BusinessLoanApplicationDto application) {
        if (application == null
                || application.getLoanPurpose() != LoanPurpose.WORKING_CAPITAL_INVENTORY) {
            throw new IllegalArgumentException(
                    "The selected Working Capital purpose is not supported by the current application API.");
        }
        if (application.getLoanAmount() == null || application.getLoanAmount().signum() <= 0
                || application.getMonthlySales() == null || application.getMonthlySales().signum() <= 0
                || application.getMonthlyExpenses() == null
                || application.getMonthlyExpenses().signum() <= 0
                || !StringUtils.hasText(application.getLoanPurposeDescription())) {
            throw new IllegalArgumentException(
                    "Working Capital amount, monthly sales, expenses, and purpose description are required.");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveApplication(application));
    }
}
