package com.taxedge.loan.msmeloan.enums;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public enum MsmeConstitution {
    PROPRIETORSHIP("Proprietorship"),
    PARTNERSHIP("Partnership Firm"),
    LLP("Limited Liability Partnership (LLP)"),
    PVT_LTD("Private Limited Company"),
    PUBLIC_LTD("Public Limited Company"),
    ONE_PERSON_COMPANY("One Person Company"),
    OTHER("Other");

    private final String displayName;

    MsmeConstitution(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    private static final Set<String> NAMES = Arrays.stream(values())
            .map(Enum::name)
            .collect(Collectors.toUnmodifiableSet());

    public static boolean contains(String name) {
        return name != null && NAMES.contains(name.trim().toUpperCase());
    }
}
