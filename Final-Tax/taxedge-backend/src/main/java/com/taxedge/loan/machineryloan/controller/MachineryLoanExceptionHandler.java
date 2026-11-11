package com.taxedge.loan.machineryloan.controller;

import java.sql.SQLException;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.Deque;
import java.util.IdentityHashMap;
import java.util.Set;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.taxedge.exception.ErrorResponse;
import com.taxedge.exception.ResourceNotFoundException;

import org.hibernate.exception.ConstraintViolationException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = MachineryLoanApplicationController.class)
public class MachineryLoanExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException exception) {
        return response(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException exception) {
        return response(HttpStatus.FORBIDDEN, "Authenticated customer access is required");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleConflict(DataIntegrityViolationException exception) {
        ConstraintDiagnostic diagnostic = findConstraintDiagnostic(exception);
        log.warn("Machinery loan data integrity conflict; exceptionClass={}, constraint={}",
                diagnostic.exceptionClass(), diagnostic.constraintName());
        return response(HttpStatus.CONFLICT, "Machinery loan operation conflicts with existing records");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxSize(MaxUploadSizeExceededException exception) {
        return response(HttpStatus.PAYLOAD_TOO_LARGE, "File size exceeds the allowable limit");
    }

    @ExceptionHandler({
            IllegalArgumentException.class,
            IllegalStateException.class,
            MethodArgumentNotValidException.class,
            HttpMessageNotReadableException.class,
            MissingServletRequestPartException.class
    })
    public ResponseEntity<ErrorResponse> handleInvalidRequest(Exception exception) {
        log.warn("Invalid machinery loan request ({})", exception.getClass().getSimpleName());
        String message = "Machinery loan request contains invalid values";
        if (exception instanceof MethodArgumentNotValidException manve && manve.getBindingResult().getFieldError() != null) {
            message = manve.getBindingResult().getFieldError().getDefaultMessage();
        } else if (exception instanceof IllegalArgumentException || exception instanceof IllegalStateException) {
            message = exception.getMessage();
        } else if (exception instanceof MissingServletRequestPartException) {
            message = "A required machinery loan submission part is missing";
        }
        return response(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception exception) {
        log.error("Machinery loan request failed ({})", exception.getClass().getSimpleName());
        return response(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Machinery loan request could not be completed. Please try again.");
    }

    private ResponseEntity<ErrorResponse> response(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(message, status.value()));
    }

    static String findConstraintName(Throwable exception) {
        return findConstraintDiagnostic(exception).constraintName();
    }

    static ConstraintDiagnostic findConstraintDiagnostic(Throwable exception) {
        Deque<Throwable> causes = new ArrayDeque<>();
        Set<Throwable> visited = Collections.newSetFromMap(new IdentityHashMap<>());
        causes.add(exception);

        String exceptionClass = exception.getClass().getSimpleName();
        ConstraintDiagnostic hibernateDiagnostic = null;
        while (!causes.isEmpty()) {
            Throwable cause = causes.removeFirst();
            if (!visited.add(cause)) {
                continue;
            }

            if (isPostgresException(cause)) {
                exceptionClass = cause.getClass().getSimpleName();
                String constraintName = findPostgresConstraintName(cause);
                if (isSafeConstraintName(constraintName)) {
                    return new ConstraintDiagnostic(exceptionClass, constraintName);
                }
            } else if (cause instanceof ConstraintViolationException violation) {
                exceptionClass = violation.getClass().getSimpleName();
                if (isSafeConstraintName(violation.getConstraintName())) {
                    hibernateDiagnostic = new ConstraintDiagnostic(
                            exceptionClass, violation.getConstraintName());
                }
            } else if (cause instanceof SQLException sqlException) {
                exceptionClass = sqlException.getClass().getSimpleName();
            }

            if (cause.getCause() != null) {
                causes.addLast(cause.getCause());
            }
            if (cause instanceof SQLException sqlException
                    && sqlException.getNextException() != null) {
                causes.addLast(sqlException.getNextException());
            }
        }

        return hibernateDiagnostic != null
                ? hibernateDiagnostic
                : new ConstraintDiagnostic(exceptionClass, "unknown");
    }

    private static boolean isPostgresException(Throwable exception) {
        return exception.getClass().getName().equals("org.postgresql.util.PSQLException");
    }

    private static String findPostgresConstraintName(Throwable exception) {
        try {
            Object serverError = exception.getClass()
                    .getMethod("getServerErrorMessage")
                    .invoke(exception);
            if (serverError == null) {
                return null;
            }
            Object constraintName = serverError.getClass()
                    .getMethod("getConstraint")
                    .invoke(serverError);
            return constraintName instanceof String name ? name : null;
        } catch (ReflectiveOperationException reflectionFailure) {
            return null;
        }
    }

    private static boolean isSafeConstraintName(String constraintName) {
        return constraintName != null
                && constraintName.matches("[A-Za-z0-9_$.-]+");
    }

    record ConstraintDiagnostic(String exceptionClass, String constraintName) {
    }
}
