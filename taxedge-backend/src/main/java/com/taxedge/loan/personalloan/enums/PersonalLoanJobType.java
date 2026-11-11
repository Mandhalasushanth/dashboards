package com.taxedge.loan.personalloan.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum PersonalLoanJobType {
    PRIVATE("Private"),
    GOVERNMENT("Government"),
    PUBLIC_SECTOR("Public Sector"),
    SELF_EMPLOYED("Self Employed"),
    PROFESSIONAL("Professional"),
    OTHER("Other");

    private final String displayLabel;

    PersonalLoanJobType(String displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }

    @JsonCreator
    public static PersonalLoanJobType fromJson(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        if ("SELF_EMPLOYED_PROFESSIONAL".equals(normalized)) {
            return PROFESSIONAL;
        }

        try {
            return valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid jobType. Allowed values: PRIVATE, GOVERNMENT, PUBLIC_SECTOR, "
                            + "SELF_EMPLOYED, PROFESSIONAL, OTHER");
        }
    }
}
