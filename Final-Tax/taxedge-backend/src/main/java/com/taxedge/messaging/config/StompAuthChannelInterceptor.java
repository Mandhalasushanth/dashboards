package com.taxedge.messaging.config;

import java.util.List;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.taxedge.security.jwt.service.JwtService;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message;
        }

        String token = extractToken(accessor);

        if (token == null || token.isBlank()) {
            log.warn("STOMP CONNECT rejected: no token, session={}", accessor.getSessionId());
            throw new MessageDeliveryException("Missing authentication token");
        }

        final String userId;
        final String role;
        try {
            if (!jwtService.isTokenValid(token)) {
                throw new MessageDeliveryException("Invalid or expired authentication token");
            }
            Claims claims = jwtService.extractClaims(token);
            userId = claims.getSubject();
            role = claims.get(JwtService.CLAIM_ROLE, String.class);

        } catch (MessageDeliveryException ex) {
            log.warn("STOMP CONNECT rejected: invalid token, session={}", accessor.getSessionId());
            throw ex;
        } catch (Exception ex) {
            log.warn("STOMP CONNECT rejected: token parse failure, session={}", accessor.getSessionId());
            throw new MessageDeliveryException("Invalid authentication token");
        }

        if (userId == null || userId.isBlank()) {
            log.warn("STOMP CONNECT rejected: token has no subject, session={}", accessor.getSessionId());
            throw new MessageDeliveryException("Invalid authentication token");
        }

        List<SimpleGrantedAuthority> authorities = (role != null && !role.isBlank())
                ? List.of(new SimpleGrantedAuthority(role))
                : List.of();

        Authentication auth =
                new UsernamePasswordAuthenticationToken(userId, null, authorities);

        accessor.setUser(auth);

        log.info("STOMP CONNECT accepted: user={}, role={}, session={}", userId, role, accessor.getSessionId());
        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        List<String> header = accessor.getNativeHeader("Authorization");
        if (header != null && !header.isEmpty()) {
            String value = header.get(0);
            return value.startsWith(BEARER_PREFIX) ? value.substring(BEARER_PREFIX.length()) : value;
        }
        return accessor.getPasscode();
    }
}
