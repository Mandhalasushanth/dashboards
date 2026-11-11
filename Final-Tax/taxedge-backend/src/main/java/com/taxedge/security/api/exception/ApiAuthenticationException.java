package com.taxedge.security.api.exception;

public class ApiAuthenticationException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ApiAuthenticationException(String message) {
        super(message);
    }

    public ApiAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}