package vn.nguyenlong.taskmanager.core.auth.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.response.TokenResponse;
import vn.nguyenlong.taskmanager.core.auth.entity.Token;

public interface TokenService {
    TokenResponse refresh(HttpServletRequest request);
    void saveToken(Token token);
}
