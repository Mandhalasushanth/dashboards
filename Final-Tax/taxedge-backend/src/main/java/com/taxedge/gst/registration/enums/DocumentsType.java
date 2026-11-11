package com.taxedge.gst.registration.enums;

public enum DocumentsType {

    PAN_CARD,
    AADHAAR_CARD,
    BUSINESS_REGISTRATION_PROOF,
    PRINCIPAL_PLACE_ADDRESS_PROOF,
    BANK_PASSBOOK_OR_CANCELLED_CHEQUE,
    PASSPORT_SIZE_PHOTOGRAPH;

    public static DocumentsType from(String value) {

        return switch (value) {

        case "panCard" -> PAN_CARD;

        case "aadhaarCard" -> AADHAAR_CARD;

        case "businessRegistrationProof" -> BUSINESS_REGISTRATION_PROOF;

        case "principalPlaceAddressProof" -> PRINCIPAL_PLACE_ADDRESS_PROOF;

        case "bankPassbookOrCancelledCheque" ->
                BANK_PASSBOOK_OR_CANCELLED_CHEQUE;

        case "passportSizePhotograph" ->
                PASSPORT_SIZE_PHOTOGRAPH;

        default -> throw new IllegalArgumentException(
                "Unknown document type: " + value);
        };
    }
}
