package vn.nguyenlong.taskmanager.core.auth.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.enums.AccountStatus;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.auth.service.ActivationAccountService;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ActivationAccountServiceImpl implements ActivationAccountService {

    private final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;

    @Override
    public String generateActiveToken(String email, Duration ttl) {
        byte[] randomBytes = new byte[24];
        SECURE_RANDOM.nextBytes(randomBytes);
        String token = BASE64_URL.encodeToString(randomBytes);
        redisTemplate.opsForValue().set("activation:" + token, email, ttl);
        return token;
    }

    @Override
    public Optional<String> consumeToken(String token) {
        String key = "activation:" + token;
        String email = redisTemplate.opsForValue().get(key);
        redisTemplate.delete(key);
        return Optional.ofNullable(email);
    }

    @Override
    public void verifyAccount(String token) {
        Optional<String> emailOpt  = consumeToken(token);
        if (emailOpt.isEmpty()) {
            throw new BadCredentialsException(MessageKeys.AUTH_INVALID_TOKEN);
        }

        String email = emailOpt.get();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(MessageKeys.USER_NOT_FOUND));

        user.setIsVerified(true);
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }
}
