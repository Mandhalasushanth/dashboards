package com.taxedge.security.otps.exception;

public class OtpRateLimitException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    public OtpRateLimitException(String message) {
    	super(message); 
    	}
}
