package com.taxedge.customer.helper;

import java.security.SecureRandom;

public final class CustomerHelper {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private CustomerHelper() {
    }

    public static String generateCustomerId() {
        StringBuilder sb = new StringBuilder("CI");
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
