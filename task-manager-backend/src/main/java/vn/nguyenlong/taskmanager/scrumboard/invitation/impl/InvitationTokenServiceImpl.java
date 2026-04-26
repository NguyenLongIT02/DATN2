package vn.nguyenlong.taskmanager.scrumboard.invitation.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import vn.nguyenlong.taskmanager.scrumboard.invitation.InvitationTokenService;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationTokenServiceImpl implements InvitationTokenService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @SneakyThrows
    public String generateInvitationToken(Map<String, Object> payload, Duration ttl) {
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        String key = "invitation:" + token;
        String value = objectMapper.writeValueAsString(payload);
        redisTemplate.opsForValue().set(key, value, ttl);
        return token;
    }

    @Override
    @SneakyThrows
    public Optional<Map<String, Object>> getInvitationToken(String token) {
        try {
            String key = "invitation:" + token;
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return Optional.empty();
            }
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<Map<String, Object>>(){});
            return Optional.of(map);
        } catch (Exception e) {
            log.error("Failed to get invitation token: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    @SneakyThrows
    public Optional<Map<String, Object>> consumeInvitationToken(String token) {
        try {
            String key = "invitation:" + token;
            String json = redisTemplate.opsForValue().get(key);
            if (json == null) {
                return Optional.empty();
            }
            redisTemplate.delete(key);
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<Map<String, Object>>(){});
            return Optional.of(map);
        } catch (Exception e) {
            log.error("Failed to consume invitation token: {}", e.getMessage());
            return Optional.empty();
        }
    }
}


