package com.taxedge.customer.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Gender {

    MALE,
    FEMALE,
    OTHER;

    @JsonCreator
    public static Gender fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String clean = value.trim().toUpperCase();
        for (Gender g : Gender.values()) {
            if (g.name().equalsIgnoreCase(clean)) {
                return g;
            }
        }
        return OTHER;
    }
}
