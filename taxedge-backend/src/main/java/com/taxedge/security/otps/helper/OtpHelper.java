package com.taxedge.security.otps.helper;

public final class OtpHelper {

    private static final String DEFAULT_COUNTRY_CODE = "+91";

    private OtpHelper() {
        throw new AssertionError("Utility class — do not instantiate");
    }

  
    public static String toE164(String mobileNumber) {
        if (mobileNumber == null) return "";
        String s = mobileNumber.trim();
        if (s.startsWith("+")) {
            return s;
        }
        if (s.startsWith("91") && s.length() == 12) {
            return "+" + s;
        }
        return DEFAULT_COUNTRY_CODE + s;
    }

        public static String extractNationalNumber(String mobileNumber) {
        if (mobileNumber == null) return "";
        String s = mobileNumber.trim();
        if (s.startsWith("+91")) {
            return s.substring(3);
        }
        if (s.startsWith("91") && s.length() == 12) {
            return s.substring(2);
        }
        return s;
    }

    
    public static String normaliseCode(String code) {
        return (code != null) ? code.trim() : "";
    }

    
    public static String mask(String e164Number) {
        if (e164Number == null || e164Number.length() < 6) {
            return "****";
        }
        return e164Number.substring(0, 3) + "***" + e164Number.substring(e164Number.length() - 2);
    }
}
