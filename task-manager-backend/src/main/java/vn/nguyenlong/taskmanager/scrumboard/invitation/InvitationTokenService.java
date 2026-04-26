package vn.nguyenlong.taskmanager.scrumboard.invitation;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

public interface InvitationTokenService {

    String generateInvitationToken(Map<String, Object> payload, Duration ttl);

    Optional<Map<String, Object>> getInvitationToken(String token);

    Optional<Map<String, Object>> consumeInvitationToken(String token);
}


