package vn.nguyenlong.taskmanager.core.auth.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.nguyenlong.taskmanager.core.auth.dto.request.LogInRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.request.RegisterRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.response.TokenResponse;
import vn.nguyenlong.taskmanager.core.auth.service.AuthenticationService;
import vn.nguyenlong.taskmanager.core.auth.service.LogoutService;
import vn.nguyenlong.taskmanager.core.component.TranslateMessage;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.util.MessageKeys;

@RestController
@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication Controller")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final LogoutService logoutService;
    private final TranslateMessage translateMessage;

    @PostMapping("/login")
    public SuccessResponse<TokenResponse> login(@Valid @RequestBody LogInRequest login,
                                                HttpServletRequest request) {
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.AUTH_LOGIN_SUCCESS),
                authenticationService.login(login, request));
    }

    @PostMapping("/logout")
    public SuccessResponse<String> logout(HttpServletRequest request) throws AccessDeniedException {
        logoutService.logoutDevice(request);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.AUTH_LOGOUT_SUCCESS));
    }

    @PostMapping("/register")
    public SuccessResponse<String> register(@Valid @RequestBody RegisterRequest register,
                                            HttpServletRequest request) {
        authenticationService.register(register, request);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.AUTH_REGISTER_SUCCESS));
    }

    @PostMapping("/refresh-token")
    public SuccessResponse<TokenResponse> refreshToken(HttpServletRequest request) {
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.AUTH_REFRESH_SUCCESS),
                authenticationService.refresh(request));
    }
}
