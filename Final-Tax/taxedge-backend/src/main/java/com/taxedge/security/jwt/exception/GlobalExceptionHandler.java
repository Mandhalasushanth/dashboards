package com.taxedge.security.jwt.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@Slf4j
@RestControllerAdvice(basePackages = "com.taxedge.security.jwt.controller")
@Component("jwtGlobalExceptionHandler")
public class GlobalExceptionHandler {

    
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(
            OptimisticLockingFailureException ex) {

        log.warn("[RefreshToken] Optimistic locking conflict during token rotation — "
                + "a concurrent refresh won the race. Returning 409 to the losing caller. "
                + "cause={}", ex.getMessage());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("errorCode", "REFRESH_IN_PROGRESS");
        body.put("message",
                "A concurrent token refresh is already in progress for this session. "
                + "Please retry after a short delay.");

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }
}
