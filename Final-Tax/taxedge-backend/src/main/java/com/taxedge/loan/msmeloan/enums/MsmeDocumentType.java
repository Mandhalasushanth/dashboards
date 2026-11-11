package com.taxedge.loan.msmeloan.enums;

import java.util.Arrays;
import java.util.Optional;

public enum MsmeDocumentType {
    PAN_CARD("panCard", "PAN Card"),
    AADHAAR_CARD("aadhaarCard", "Aadhaar Card"),
    UDYAM_CERTIFICATE("udyamCertificate", "Udyam Registration Certificate"),
    GST_CERTIFICATE("gstCertificate", "GST Certificate"),
    BANK_STATEMENTS("bankStatements", "Bank Statement (Last 6 Months)"),
    ITR_RETURNS("itrReturns", "Income Tax Returns"),
    FINANCIAL_STATEMENTS("financialStatements", "Audited Financial Statements");

    private final String key;
    private final String displayName;

    MsmeDocumentType(String key, String displayName) {
        this.key = key;
        this.displayName = displayName;
    }

    public String getKey() {
        return key;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Optional<MsmeDocumentType> fromKey(String key) {
        if (key == null) return Optional.empty();
        String normalized = key.trim().toLowerCase().replaceAll("[_-]", "");
        return Arrays.stream(values())
                .filter(t -> t.name().toLowerCase().replaceAll("[_-]", "").equals(normalized)
                        || t.key.toLowerCase().replaceAll("[_-]", "").equals(normalized))
                .findFirst();
    }
}
