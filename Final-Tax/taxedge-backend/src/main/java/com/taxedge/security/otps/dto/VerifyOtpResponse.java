package com.taxedge.security.otps.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOtpResponse {

    private boolean verified;
    private boolean isExistingUser;
    private String mobileNumber;
    private String message;
}

