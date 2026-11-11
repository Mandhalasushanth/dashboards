package com.taxedge.security.jwt.controller;

import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.security.jwt.dto.TokenValidationResponse;
import io.jsonwebtoken.Claims;

import com.taxedge.customer.entity.Customer;
import com.taxedge.security.jwt.dto.RefreshTokenRequest;
import com.taxedge.security.jwt.dto.RefreshTokenResponse;
import com.taxedge.security.jwt.entity.RefreshToken;
import com.taxedge.security.jwt.service.JwtService;
import com.taxedge.security.jwt.service.RefreshTokenService;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        if (request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }

        Optional<RefreshToken> tokenOptional =
                refreshTokenService.validateRefreshToken(request.getRefreshToken());

        if (tokenOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or expired refresh token");
        }

        RefreshToken refreshTokenEntity = tokenOptional.get();
        Customer customer = refreshTokenEntity.getCustomer();

        String newAccessToken = jwtService.generateToken(
                customer.getCustId(),
                customer.getName(),
                customer.getMobileNumber()
        );

        String newRefreshToken = refreshTokenService.rotateRefreshToken(refreshTokenEntity);

        RefreshTokenResponse response = RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .build();

        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(TokenValidationResponse.builder()
                            .valid(false)
                            .reason("Missing or malformed Authorization header")
                            .build());
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(TokenValidationResponse.builder()
                            .valid(false)
                            .reason("Token is empty")
                            .build());
        }

        // isTokenValid() uses the HMAC secret to verify signature AND checks expiry
        boolean isValid = jwtService.isTokenValid(token);

        if (!isValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(TokenValidationResponse.builder()
                            .valid(false)
                            .reason("Token signature is invalid or token has expired")
                            .build());
        }

        // Extract claims only after signature + expiry are confirmed valid
        Claims claims = jwtService.extractClaims(token);
        return ResponseEntity.ok(TokenValidationResponse.builder()
                .valid(true)
                .custId(claims.getSubject())
                .expiresAt(claims.getExpiration().getTime())
                .build());
    }

    @PostMapping("/revoke")
    public ResponseEntity<String> revokeToken(@RequestBody RefreshTokenRequest request) {
        if (request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }

        refreshTokenService.revokeRefreshToken(request.getRefreshToken());
        return ResponseEntity.ok("Refresh token revoked successfully");
    }
}
