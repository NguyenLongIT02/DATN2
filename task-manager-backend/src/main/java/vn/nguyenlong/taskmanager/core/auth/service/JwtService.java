package vn.nguyenlong.taskmanager.core.auth.service;

import org.springframework.security.core.userdetails.UserDetails;
import vn.nguyenlong.taskmanager.core.auth.enums.TokenType;

public interface JwtService {
    String generateToken(UserDetails user);

    String extractUsername(String token, TokenType type);

    boolean isValidToken(String token, TokenType type, UserDetails user);

    boolean validateRefreshToken(String token);

    String generateRefreshToken(UserDetails user, String refreshTokenUuid);
}
