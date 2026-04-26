package vn.nguyenlong.taskmanager.websocket.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import vn.nguyenlong.taskmanager.websocket.dto.WebSocketMessage;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    
    // Map to store sessions by userId: Map<userId, Set<WebSocketSession>>
    // A user can have multiple sessions (multiple tabs/devices)
    private final Map<Long, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = extractUserIdFromUri(session.getUri().toString());
        
        // TODO: CRITICAL - Add authentication validation here
        // Currently anyone can connect to any user's notification WebSocket without authentication
        // Should validate JWT token from session attributes or query params
        // Example: validateUserAuthentication(session, userId);
        
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet())
                .add(session);
        
        log.info("WebSocket connection established for user: {}, session: {}", userId, session.getId());
        
        WebSocketMessage welcomeMessage = WebSocketMessage.builder()
                .type("CONNECTION_ESTABLISHED")
                .timestamp(java.time.LocalDateTime.now())
                .build();
        
        sendMessage(session, welcomeMessage);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        log.debug("Received message from session {}: {}", session.getId(), message.getPayload());
        
        // TODO: HIGH - Add message validation and authorization
        // Currently accepts any message without validation
        // Should validate:
        // 1. Message format and structure
        // 2. User has permission to perform action
        // 3. Rate limiting to prevent spam
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
        removeSession(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        log.info("WebSocket connection closed for session: {}, status: {}", session.getId(), closeStatus);
        removeSession(session);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * Send notification to a specific user (all their active sessions)
     */
    public void sendNotificationToUser(Long userId, WebSocketMessage message) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null && !sessions.isEmpty()) {
            sessions.forEach(session -> {
                try {
                    sendMessage(session, message);
                } catch (Exception e) {
                    log.error("Error sending notification to session {}: {}", session.getId(), e.getMessage());
                    // Remove invalid session
                    removeSession(session);
                }
            });
            log.info("Sent notification to {} sessions for user: {}", sessions.size(), userId);
        } else {
            log.debug("No active sessions found for user: {}", userId);
        }
    }

    /**
     * Send message to a specific session
     */
    private void sendMessage(WebSocketSession session, WebSocketMessage message) {
        try {
            if (session.isOpen()) {
                String jsonMessage = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(jsonMessage));
            }
        } catch (IOException e) {
            log.error("Error sending message to session {}: {}", session.getId(), e.getMessage());
            throw new RuntimeException("Failed to send WebSocket message", e);
        }
    }

    /**
     * Remove session from map
     */
    private void removeSession(WebSocketSession session) {
        Long userId = extractUserIdFromUri(session.getUri().toString());
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
        }
    }

    /**
     * Extract userId from URI path
     */
    private Long extractUserIdFromUri(String uri) {
        // URI format: /ws/notifications/{userId}
        String[] parts = uri.split("/");
        return Long.parseLong(parts[parts.length - 1]);
    }

    /**
     * Get number of active sessions for a user
     */
    public int getActiveSessionCount(Long userId) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        return sessions != null ? sessions.size() : 0;
    }
}
