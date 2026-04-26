package vn.nguyenlong.taskmanager.core.auth.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.request.LogInRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.request.RegisterRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.response.TokenResponse;

public interface AuthenticationService {
    TokenResponse login(LogInRequest request, HttpServletRequest webRequest);
    void register(RegisterRequest request, HttpServletRequest webRequest);
    TokenResponse refresh(HttpServletRequest request);
}
