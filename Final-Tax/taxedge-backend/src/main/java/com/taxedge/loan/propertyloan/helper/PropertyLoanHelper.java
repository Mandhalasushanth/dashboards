package com.taxedge.loan.propertyloan.helper;

import java.time.Year;
import java.util.Locale;
import java.util.UUID;

public class PropertyLoanHelper {

    private static final String PREFIX = "LOAN-PRP";

    private PropertyLoanHelper() {}

    /**
     * Formats next Property Loan application ID as LOAN-PRP-YYYY-XXXXX
     * Example: LOAN-PRP-2026-00001
     */
    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format(Locale.ROOT, "%s-%d-%05d", PREFIX, year, sequenceNumber);
    }

    public static String generateLoanApplicationId() {
        return formatLoanApplicationId(Year.now().getValue(), 1);
    }

    public static String generateDocumentId() {
        return "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }
}
