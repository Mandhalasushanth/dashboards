package com.taxedge.security.otp.service;

import com.taxedge.security.otp.entity.Otp;

public interface OtpService {
    String generateOtp(Otp otp);
    boolean verifyOtp(Otp otp);
}
