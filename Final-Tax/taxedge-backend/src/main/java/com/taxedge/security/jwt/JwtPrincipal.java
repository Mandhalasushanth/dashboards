package com.taxedge.security.jwt;

import java.security.Principal;

public record JwtPrincipal(
        String custId,
        String name,
        String mobileNumber,
        String role
) implements Principal {
    @Override
    public String getName() {
        return custId;
    }
}
