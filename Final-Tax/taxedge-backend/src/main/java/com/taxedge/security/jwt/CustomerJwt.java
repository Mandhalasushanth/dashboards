package com.taxedge.security.jwt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerJwt {

    private String accessToken;

    private String refreshToken;

    private String custId;

    private String name;

    private String mobileNumber;
}
