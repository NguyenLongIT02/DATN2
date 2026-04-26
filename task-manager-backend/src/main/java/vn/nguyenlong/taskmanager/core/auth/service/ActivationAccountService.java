package vn.nguyenlong.taskmanager.core.auth.service;

import java.time.Duration;
import java.util.Optional;

public interface ActivationAccountService {
    String generateActiveToken(String email, Duration ttl);
    Optional<String> consumeToken(String token);
    void verifyAccount(String token);
}
