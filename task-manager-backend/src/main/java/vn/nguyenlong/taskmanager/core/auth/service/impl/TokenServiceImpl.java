package vn.nguyenlong.taskmanager.core.auth.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.auth.dto.response.TokenResponse;
import vn.nguyenlong.taskmanager.core.auth.entity.Token;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.enums.TokenType;
import vn.nguyenlong.taskmanager.core.auth.repository.TokenRepository;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.auth.service.JwtService;
import vn.nguyenlong.taskmanager.core.auth.service.TokenService;
import vn.nguyenlong.taskmanager.core.auth.service.UserDeviceTokenService;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.util.MessageKeys;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDeviceTokenService userDeviceTokenService;
    private final TokenRepository tokenRepository;

    @Transactional
    @Override
    public TokenResponse refresh(HttpServletRequest request) {
        String deviceId = request.getHeader("x-device-id");
        if (StringUtils.isBlank(deviceId)) {
            throw new BadCredentialsException(MessageKeys.AUTH_INVALID_DEVICE_ID);
        }

        String refreshToken = request.getHeader("x-token");
        if (StringUtils.isBlank(refreshToken)) {
            throw new BadCredentialsException(MessageKeys.AUTH_INVALID_TOKEN);
        }

        // valid refresh token
        if (!jwtService.validateRefreshToken(refreshToken)) {
            throw new BadCredentialsException(MessageKeys.AUTH_INVALID_TOKEN);
        }

        final String username = jwtService.extractUsername(refreshToken, TokenType.REFRESH_TOKEN);
        User user = userRepository.findByUsername(username).orElseThrow(
                () -> new NotFoundException(MessageKeys.USER_NOT_FOUND)
        );
        userDeviceTokenService.validateAndLimitDeviceIp(user, deviceId);
        String newAccessToken = jwtService.generateToken(user);
        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveToken(Token token) {
        tokenRepository.save(token);
    }
}
