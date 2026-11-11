package com.taxedge.security.otps.service;


public interface OtpServices {

   
    void sendOtp(String mobileNumber);

    
    boolean verifyOtp(String mobileNumber, String code);
}