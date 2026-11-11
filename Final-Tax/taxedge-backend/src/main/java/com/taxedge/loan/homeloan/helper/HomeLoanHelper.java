package com.taxedge.loan.homeloan.helper;

import java.time.Year;
import java.util.Locale;

public final class HomeLoanHelper {

    private static final String PREFIX = "LOAN-HOM";

    private HomeLoanHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    /**
     * Formats next Home Loan application ID as LOAN-HOM-YYYY-XXXXX
     * Example: LOAN-HOM-2026-00001
     */
    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format(Locale.ROOT, "%s-%d-%05d", PREFIX, year, sequenceNumber);
    }

    public static String generateHomeLoanApplicationId() {
        return formatLoanApplicationId(Year.now().getValue(), 1);
    }
}
