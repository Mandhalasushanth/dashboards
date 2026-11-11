package com.taxedge.customer.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum CustomerType {

    INDIVIDUAL,
    PROPRIETORSHIP,
    PARTNERSHIP,
    LLP,
    PRIVATE_LIMITED,
    PUBLIC_LIMITED,
    HUF,
    AOP_BOI,
    FREELANCER,
    NGO_TRUST,

    // Legacy / alias compatibility
    SALARIED,
    BUSINESS,
    COMPANY,
    FREELANCER_CONSULTANT;

    @JsonCreator
    public static CustomerType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return INDIVIDUAL;
        }
        String clean = value.trim().toUpperCase().replace('/', '_').replace(' ', '_').replaceAll("_+", "_");

        for (CustomerType type : CustomerType.values()) {
            if (type.name().equalsIgnoreCase(clean)) {
                return type;
            }
        }

        if (clean.contains("FREELANCER")) return FREELANCER;
        if (clean.contains("PUBLIC_LIMITED") || clean.contains("PUBLIC")) return PUBLIC_LIMITED;
        if (clean.contains("PRIVATE_LIMITED") || clean.contains("PVT")) return PRIVATE_LIMITED;
        if (clean.contains("PROPRIETOR")) return PROPRIETORSHIP;
        if (clean.contains("PARTNER")) return PARTNERSHIP;
        if (clean.contains("LLP")) return LLP;
        if (clean.contains("HUF")) return HUF;
        if (clean.contains("AOP") || clean.contains("BOI")) return AOP_BOI;
        if (clean.contains("NGO") || clean.contains("TRUST")) return NGO_TRUST;
        if (clean.contains("SALARIED")) return SALARIED;
        if (clean.contains("COMPANY")) return COMPANY;
        if (clean.contains("BUSINESS")) return BUSINESS;

        return INDIVIDUAL;
    }
}
