package vn.nguyenlong.taskmanager.core.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.nguyenlong.taskmanager.core.auth.entity.Token;
import vn.nguyenlong.taskmanager.core.auth.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByRefreshTokenUuid(String refreshTokenUuid);
    Optional<Token> findByUserAndDeviceIdAndRevokedFalseAndExpiredFalse(User user, String deviceId);
    List<Token> findByUserAndRevokedFalseAndExpiredFalse(User user);
}
