package com.taxedge.loan.personalloan.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum NatureOfBusiness {
    TRADING("Trading"),
    SERVICES("Services"),
    MANUFACTURING("Manufacturing"),
    RETAIL("Retail"),
    PROFESSIONAL("Professional"),
    OTHER("Other");

    private final String displayLabel;

    NatureOfBusiness(String displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }

    @JsonCreator
    public static NatureOfBusiness fromJson(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        try {
            return valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid natureOfBusiness. Allowed values: TRADING, SERVICES, "
                            + "MANUFACTURING, RETAIL, PROFESSIONAL, OTHER");
        }
    }
}
