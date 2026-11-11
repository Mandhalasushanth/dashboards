package com.taxedge.loan.msmeloan.enums;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public enum MsmeBusinessActivity {
    MANUFACTURING("Manufacturing"),
    SERVICE("Service"),
    TRADING("Trading"),
    SERVICE_PROVIDER("Service Provider"),
    WHOLESALE_TRADING("Wholesale Trading"),
    RETAIL_TRADING("Retail Trading"),
    IT_SOFTWARE_SERVICES("IT / Software Services"),
    FOOD_AGRO_PROCESSING("Food & Agro Processing"),
    TEXTILES_APPAREL("Textiles & Apparel"),
    AUTOMOTIVE_ENGINEERING("Automotive & Engineering"),
    OTHER("Other");

    private final String displayName;

    MsmeBusinessActivity(String displayName) {
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
