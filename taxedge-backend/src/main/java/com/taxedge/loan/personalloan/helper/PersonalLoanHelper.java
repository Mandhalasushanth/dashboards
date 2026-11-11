package com.taxedge.loan.personalloan.helper;

import java.time.Year;
import java.util.Locale;

public class PersonalLoanHelper {

    private static final String PREFIX = "LOAN-PER";

    private PersonalLoanHelper() {}

    /**
     * Formats next Personal Loan application ID as LOAN-PER-YYYY-XXXXX
     * Example: LOAN-PER-2026-00001
     */
    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format(Locale.ROOT, "%s-%d-%05d", PREFIX, year, sequenceNumber);
    }

    public static String generateLoanApplicationId() {
        return formatLoanApplicationId(Year.now().getValue(), 1);
    }
}
