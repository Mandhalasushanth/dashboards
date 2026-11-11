package com.taxedge.loan.vehicleloan.helper;

import java.time.Year;
import java.util.Locale;

public final class VehicleLoanHelper {

    private static final String PREFIX = "LOAN-VEH";

    private VehicleLoanHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

    /**
     * Formats next Vehicle Loan application ID as LOAN-VEH-YYYY-XXXXX
     * Example: LOAN-VEH-2026-00001
     */
    public static String formatLoanApplicationId(int year, long sequenceNumber) {
        return String.format(Locale.ROOT, "%s-%d-%05d", PREFIX, year, sequenceNumber);
    }

    public static String generateVehicleLoanApplicationId() {
        return formatLoanApplicationId(Year.now().getValue(), 1);
    }
}
