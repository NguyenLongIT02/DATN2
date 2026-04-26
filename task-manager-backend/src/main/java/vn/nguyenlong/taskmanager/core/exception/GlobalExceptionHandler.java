package vn.nguyenlong.taskmanager.core.exception;

import org.springframework.web.servlet.resource.NoResourceFoundException;
import vn.nguyenlong.taskmanager.core.component.LocalizationComponent;
import vn.nguyenlong.taskmanager.core.component.TranslateMessage;
import vn.nguyenlong.taskmanager.core.entity.ApiErrorResponse;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.core.exception.payload.ValidationException;
import vn.nguyenlong.taskmanager.util.MessageKeys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends TranslateMessage {

    public GlobalExceptionHandler(LocalizationComponent localizationComponent) {
        super(localizationComponent);
    }

    // ------------------- AppException / Business logic -------------------
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiErrorResponse> handleAppException(AppException ex, WebRequest request) {
        log.error("AppException: code={}, message={}", ex.getErrorCode().getCode(), ex.getMessage());
        ErrorCode errorCode = ex.getErrorCode();
        return buildResponseEntity(
                errorCode.getCode(),
                errorCode.getMessage(),
                errorCode.getHttpStatus(),
                request
        );
    }

    // ------------------- Not Found / Validation -------------------
    @ExceptionHandler({NotFoundException.class, ValidationException.class, NoResourceFoundException.class})
    public ResponseEntity<ApiErrorResponse> handleSpecificExceptions(Exception ex, WebRequest request) {
        HttpStatus status = (ex instanceof ValidationException) ? HttpStatus.BAD_REQUEST : HttpStatus.NOT_FOUND;
        String message = ErrorCode.SYSTEM_INTERNAL_ERROR.getMessage();
        if (ex instanceof ValidationException) {
            message = ex.getMessage();
        }
        else if (ex instanceof NoResourceFoundException) {
            message = ErrorCode.SYSTEM_NOT_FOUND.getMessage();
        }
        else if (ex instanceof NotFoundException) {
            message = ex.getMessage();
        }

        return buildResponseEntity(
                status.value(),
                message,
                status,
                request
        );
    }

    // ------------------- Spring Security -------------------
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(WebRequest request) {
        return buildResponseEntity(
                ErrorCode.AUTH_UNAUTHORIZED.getCode(),
                ErrorCode.AUTH_UNAUTHORIZED.getMessage(),
                ErrorCode.AUTH_UNAUTHORIZED.getHttpStatus(),
                request
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthentication(AuthenticationException ex, WebRequest request) {
        String message = ErrorCode.AUTH_UNAUTHENTICATED.getMessage();
        if (ex instanceof DisabledException) {
            message = MessageKeys.AUTH_ACCOUNT_UNVERIFIED;
        } else if (ex instanceof LockedException) {
            message = MessageKeys.AUTH_ACCOUNT_LOCKED;
        } else if (ex instanceof CredentialsExpiredException) {
            message = MessageKeys.AUTH_INVALID_CREDENTIALS;
        }
        return buildResponseEntity(
                ErrorCode.AUTH_UNAUTHENTICATED.getCode(),
                message,
                ErrorCode.AUTH_UNAUTHENTICATED.getHttpStatus(),
                request
        );
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(WebRequest request) {
        return buildResponseEntity(
                ErrorCode.AUTH_INVALID_CREDENTIALS.getCode(),
                ErrorCode.AUTH_INVALID_CREDENTIALS.getMessage(),
                ErrorCode.AUTH_INVALID_CREDENTIALS.getHttpStatus(),
                request
        );
    }

    // ------------------- HTTP / Method Not Allowed -------------------
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        String errorDetail = ErrorCode.SYSTEM_METHOD_NOT_ALLOWED.getMessage() + ": " + ex.getMethod();
        return buildResponseEntity(
                ErrorCode.SYSTEM_METHOD_NOT_ALLOWED.getCode(),
                errorDetail,
                ErrorCode.SYSTEM_METHOD_NOT_ALLOWED.getHttpStatus(),
                request
        );
    }

    // ------------------- Constraint -------------------
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgNotValid(MethodArgumentNotValidException ex, WebRequest request) {
        List<String> messages = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(err -> messages.add(err.getDefaultMessage()));
        return buildResponseEntity(
                ErrorCode.SYSTEM_VALIDATION_FAILED.getCode(),
                messages,
                ErrorCode.SYSTEM_VALIDATION_FAILED.getHttpStatus(),
                request
        );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        List<String> messages = new ArrayList<>();
        ex.getConstraintViolations().forEach(v -> messages.add(v.getPropertyPath() + ": " + v.getMessage()));
        return buildResponseEntity(
                ErrorCode.SYSTEM_VALIDATION_FAILED.getCode(),
                messages,
                ErrorCode.SYSTEM_VALIDATION_FAILED.getHttpStatus(),
                request
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        log.warn("IllegalArgumentException caught: {}", ex.getMessage());
        // Don't translate dynamic validation messages
        ApiErrorResponse response = ApiErrorResponse.builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest request) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        return buildResponseEntity(
                HttpStatus.CONFLICT.value(),
                MessageKeys.SYSTEM_DATABASE_ERROR,
                HttpStatus.CONFLICT,
                request
        );
    }

    // ------------------- Database / fallback -------------------
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleFallback(Exception ex, WebRequest request) {
        log.error("Unhandled exception: type={}, message={}", ex.getClass().getSimpleName(), ex.getMessage());
        return buildResponseEntity(
                ErrorCode.SYSTEM_INTERNAL_ERROR.getCode(),
                ErrorCode.SYSTEM_INTERNAL_ERROR.getMessage(),
                ErrorCode.SYSTEM_INTERNAL_ERROR.getHttpStatus(),
                request
        );
    }

    // ------------------- Helper -------------------
    private ResponseEntity<ApiErrorResponse> buildResponseEntity(int code, String message, HttpStatus status, WebRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .code(code)
                .message(translate(message))
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(status).body(response);
    }

    private ResponseEntity<ApiErrorResponse> buildResponseEntity(int code, List<String> messages, HttpStatus status, WebRequest request) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .code(code)
                .message(messages.stream().map(this::translate).toList())
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(Instant.now())
                .build();
        return ResponseEntity.status(status).body(response);
    }
}
