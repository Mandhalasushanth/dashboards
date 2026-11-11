package com.taxedge.security.jwt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponse {

    /** Whether the token has a valid HMAC signature and has not expired */
    private boolean valid;

    /** Human-readable reason when valid=false */
    private String reason;

    /** The custId (subject) extracted from the token — only set when valid=true */
    private String custId;

    /** Token expiration epoch-millis — only set when valid=true */
    private Long expiresAt;
}
