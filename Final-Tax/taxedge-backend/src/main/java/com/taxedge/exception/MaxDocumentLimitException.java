package com.taxedge.exception;

public class MaxDocumentLimitException extends RuntimeException {

    public MaxDocumentLimitException(String message) {
        super(message);
    }
}
