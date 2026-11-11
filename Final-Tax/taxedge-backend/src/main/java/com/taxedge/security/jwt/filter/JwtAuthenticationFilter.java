package com.taxedge.security.jwt.filter;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.security.jwt.JwtPrincipal;
import com.taxedge.security.jwt.service.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

       
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(BEARER_PREFIX.length()).trim();

        // Reject empty token strings (e.g. "Bearer " with trailing space only)
        if (!StringUtils.hasText(jwt)) {
            log.warn("[JWT] Empty Bearer token from {}", request.getRemoteAddr());
            rejectWithUnauthorized(request, response, "TOKEN_MISSING", "Bearer token is empty");
            return;
        }


        final Claims claims;
        try {
            claims = jwtService.extractClaims(jwt);
        } catch (ExpiredJwtException ex) {
            log.info("[JWT] Expired token for [{} {}]", request.getMethod(), request.getRequestURI());
            rejectWithUnauthorized(request, response, "TOKEN_EXPIRED",
                    "Access token has expired. Please refresh your session.");
            return;
        } catch (SignatureException ex) {
            log.warn("[JWT] Invalid signature from {} for [{} {}]",
                    request.getRemoteAddr(), request.getMethod(), request.getRequestURI());
            rejectWithUnauthorized(request, response, "TOKEN_SIGNATURE_INVALID",
                    "Token signature verification failed");
            return;
        } catch (MalformedJwtException ex) {
            log.warn("[JWT] Malformed token from {} for [{} {}]",
                    request.getRemoteAddr(), request.getMethod(), request.getRequestURI());
            rejectWithUnauthorized(request, response, "TOKEN_MALFORMED",
                    "Token format is invalid");
            return;
        } catch (Exception ex) {
            log.error("[JWT] Unexpected error parsing token for [{} {}]: {}",
                    request.getMethod(), request.getRequestURI(), ex.getMessage());
            rejectWithUnauthorized(request, response, "TOKEN_ERROR",
                    "An error occurred while processing the token");
            return;
        }


        final String custId = claims.getSubject();
        if (!StringUtils.hasText(custId)) {
            log.warn("[JWT] Token has no subject (custId) claim from {}", request.getRemoteAddr());
            rejectWithUnauthorized(request, response, "TOKEN_MALFORMED",
                    "Token is missing required subject claim");
            return;
        }

        final String name         = claims.get(JwtService.CLAIM_NAME,   String.class);
        final String mobileNumber = claims.get(JwtService.CLAIM_MOBILE, String.class);
        final String role         = claims.get(JwtService.CLAIM_ROLE,   String.class);


        final String effectiveRole = StringUtils.hasText(role) ? role : JwtService.ROLE_CUSTOMER;


        if (SecurityContextHolder.getContext().getAuthentication() == null) {

            JwtPrincipal principal = new JwtPrincipal(custId, name, mobileNumber, effectiveRole);

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            List.of(new SimpleGrantedAuthority(effectiveRole))
                    );

            authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.debug("[JWT] Authenticated [{}] role=[{}] for [{} {}]",
                    custId, effectiveRole, request.getMethod(), request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

   
    private void rejectWithUnauthorized(
            HttpServletRequest request,
            HttpServletResponse response,
            String errorCode,
            String message
    ) throws IOException {

        if (response.isCommitted()) {
            log.warn("[JWT] Response already committed — cannot write 401 for {}", request.getRequestURI());
            return;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status",    HttpStatus.UNAUTHORIZED.value());
        body.put("error",     HttpStatus.UNAUTHORIZED.getReasonPhrase());
        body.put("code",      errorCode);
        body.put("message",   message);
        body.put("path",      request.getRequestURI());

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
