package com.taxedge.loan.msmeloan.helper;

import java.util.UUID;

public final class MsmeLoanHelper {

    private MsmeLoanHelper() {}

    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format("LOAN-MSME-%04d-%05d", year, sequenceNumber);
    }

    public static String generateLoanApplicationId(int year) {
        String randomSuffix = UUID.randomUUID().toString().replace("-", "")
                .substring(0, 15)
                .toUpperCase();
        return String.format("LOAN-MSME-%04d-%s", year, randomSuffix);
    }
}
