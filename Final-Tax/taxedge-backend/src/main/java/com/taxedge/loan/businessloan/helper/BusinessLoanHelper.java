package com.taxedge.loan.businessloan.helper;

import java.time.Year;
import java.util.Locale;

public class BusinessLoanHelper {

    private static final String PREFIX = "LOAN-BIZ";

    private BusinessLoanHelper() {}

    /**
     * Formats next Business Loan application ID as LOAN-BIZ-YYYY-XXXXX
     * Example: LOAN-BIZ-2026-00001
     */
    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format(Locale.ROOT, "%s-%d-%05d", PREFIX, year, sequenceNumber);
    }

    public static String generateLoanApplicationId() {
        return formatLoanApplicationId(Year.now().getValue(), 1);
    }
}
