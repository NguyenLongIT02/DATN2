package vn.nguyenlong.taskmanager.core.auth.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.auth.dto.request.LogInRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.request.RegisterRequest;
import vn.nguyenlong.taskmanager.core.auth.dto.response.TokenResponse;
import vn.nguyenlong.taskmanager.core.auth.entity.Role;
import vn.nguyenlong.taskmanager.core.auth.entity.Token;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.entity.UserRole;
import vn.nguyenlong.taskmanager.core.auth.enums.AccountStatus;
import vn.nguyenlong.taskmanager.core.auth.enums.RoleType;
import vn.nguyenlong.taskmanager.core.auth.repository.RoleRepository;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRoleRepository;
import vn.nguyenlong.taskmanager.core.auth.service.AuthenticationService;
import vn.nguyenlong.taskmanager.core.auth.service.JwtService;
import vn.nguyenlong.taskmanager.core.auth.service.TokenService;
import vn.nguyenlong.taskmanager.core.auth.service.UserDeviceTokenService;
import vn.nguyenlong.taskmanager.core.exception.payload.ValidationException;
import vn.nguyenlong.taskmanager.util.DeviceUtils;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final UserDeviceTokenService userDeviceTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserRoleRepository userRoleRepository;


    @Value("${jwt.expiration-refresh-token}")
    private long expirationRefreshTokenTime;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TokenResponse login(LogInRequest request, HttpServletRequest webRequest) {
        log.info("------------------- Authenticating ---------------------");
        var user = userRepository.findUserByUsernameOrEmail(request.getUsername(), request.getUsername()).orElseThrow(
                () -> new ValidationException(MessageKeys.AUTH_INVALID_CREDENTIALS)
        );
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        String deviceId = webRequest.getHeader("x-device-id");
        userDeviceTokenService.validateAndLimitDeviceIp(user, deviceId);

        String accessToken = jwtService.generateToken(user);
        String refreshTokenUuid = UUID.randomUUID().toString();
        String refreshToken = jwtService.generateRefreshToken(user, refreshTokenUuid);

        Token token = Token.builder()
                .user(user)
                .refreshTokenUuid(refreshTokenUuid)
                .deviceId(deviceId)
                .deviceType(DeviceUtils.parseDeviceType(webRequest.getHeader("User-Agent")))
                .revoked(false)
                .expired(false)
                .expiresAt(Instant.now().plusMillis(expirationRefreshTokenTime))
                .build();
        tokenService.saveToken(token);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void register(RegisterRequest request, HttpServletRequest webRequest) {
        Optional<User> existingUser = userRepository.findUserByUsernameOrEmail(request.getUsername(), request.getEmail());
        if (existingUser.isPresent()) {
            if (existingUser.get().getUsername().equals(request.getUsername())) {
                throw new ValidationException(MessageKeys.USERNAME_ALREADY_EXISTS);
            }
            if (existingUser.get().getEmail().equals(request.getEmail())) {
                throw new ValidationException(MessageKeys.EMAIL_ALREADY_EXISTS);
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFull_name())
                .password(passwordEncoder.encode(request.getPassword()))
                .isVerified(true)
                .status(AccountStatus.ACTIVE)
                .build();
        userRepository.save(user);

        Role roleUser = roleRepository.findByName(RoleType.USER);
        UserRole userRole = UserRole.builder()
                .userId(user.getId())
                .roleId(roleUser.getId())
                .build();
        userRoleRepository.save(userRole);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TokenResponse refresh(HttpServletRequest request) {
        return tokenService.refresh(request);
    }

}
