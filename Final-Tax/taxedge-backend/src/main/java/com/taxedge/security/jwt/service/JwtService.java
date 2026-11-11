package com.taxedge.security.jwt.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

   
    public static final String CLAIM_ROLE   = "role";
    
    public static final String CLAIM_NAME   = "name";

    public static final String CLAIM_MOBILE = "mobileNumber";
   
    public static final String CLAIM_EMAIL  = "email";

    public static final String ROLE_CUSTOMER = "ROLE_CUSTOMER";

  

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

   
    public String generateToken(String custId, String name, String mobileNumber) {
        return Jwts.builder()
                .subject(custId)
                .claim(CLAIM_NAME, name)
                .claim(CLAIM_MOBILE, mobileNumber)
                .claim(CLAIM_ROLE, ROLE_CUSTOMER)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

   
  
    public String generateStaffToken(String subject, String name, String email, String role) {
        return Jwts.builder()
                .subject(subject)
                .claim(CLAIM_NAME, name)
                .claim(CLAIM_EMAIL, email)
                .claim(CLAIM_ROLE, role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

 
    public String extractCustId(String token) {
        return extractClaims(token).getSubject();
    }

   
    public boolean validateToken(String token) {
        Claims claims = extractClaims(token); // throws on invalid sig / expiry
        return !claims.getExpiration().before(new Date());
    }

   
    public boolean isTokenValid(String token) {
        try {
            return validateToken(token);
        } catch (ExpiredJwtException ex) {
            log.debug("[JwtService] Token expired: {}", ex.getMessage());
            return false;
        } catch (SignatureException ex) {
            log.warn("[JwtService] Token signature invalid: {}", ex.getMessage());
            return false;
        } catch (MalformedJwtException ex) {
            log.warn("[JwtService] Malformed token: {}", ex.getMessage());
            return false;
        } catch (Exception ex) {
            log.error("[JwtService] Unexpected token validation error: {}", ex.getMessage());
            return false;
        }
    }
}
