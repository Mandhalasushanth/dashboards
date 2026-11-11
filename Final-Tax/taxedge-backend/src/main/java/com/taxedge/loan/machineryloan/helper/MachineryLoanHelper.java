package com.taxedge.loan.machineryloan.helper;

import java.time.Year;
import java.util.Locale;

public final class MachineryLoanHelper {

    private static final String PREFIX = "LOAN-MAC";

    private MachineryLoanHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    /**
     * Formats next Machinery Loan application ID as LOAN-MAC-YYYY-XXXXX
     * Example: LOAN-MAC-2026-00001
     */
    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format(Locale.ROOT, "%s-%d-%05d", PREFIX, year, sequenceNumber);
    }

    public static String generateMachineryLoanApplicationId() {
        return formatLoanApplicationId(Year.now().getValue(), 1);
    }
}
