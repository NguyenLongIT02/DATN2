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
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class BoardWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    
    // Map để lưu trữ các session theo boardId
    private final Map<String, Map<String, WebSocketSession>> boardSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String boardId = extractBoardIdFromUri(session.getUri().toString());
        String sessionId = session.getId();
        
        // TODO: CRITICAL - Add authentication validation here
        // Currently anyone can connect to any board WebSocket without authentication
        // Should validate JWT token from session attributes or query params
        // Example: validateUserHasAccessToBoard(session, boardId);
        
        boardSessions.computeIfAbsent(boardId, k -> new ConcurrentHashMap<>())
                .put(sessionId, session);
        
        log.info("WebSocket connection established for board: {}, session: {}", boardId, sessionId);
        
        WebSocketMessage welcomeMessage = WebSocketMessage.builder()
                .type("CONNECTION_ESTABLISHED")
                .boardId(boardId)
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
        // 3. Board ID matches session board ID
        // 4. Rate limiting to prevent spam
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
     * Broadcast message đến tất cả sessions của một board
     */
    public void broadcastToBoard(String boardId, WebSocketMessage message) {
        Map<String, WebSocketSession> sessions = boardSessions.get(boardId);
        if (sessions != null && !sessions.isEmpty()) {
            sessions.values().forEach(session -> {
                try {
                    sendMessage(session, message);
                } catch (Exception e) {
                    log.error("Error broadcasting to session {}: {}", session.getId(), e.getMessage());
                    // Remove invalid session
                    removeSession(session);
                }
            });
            log.info("Broadcasted message to {} sessions for board: {}", sessions.size(), boardId);
        } else {
            log.warn("No active sessions found for board: {}", boardId);
        }
    }

    /**
     * Gửi message đến một session cụ thể
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
     * Xóa session khỏi map
     */
    private void removeSession(WebSocketSession session) {
        String boardId = extractBoardIdFromUri(session.getUri().toString());
        Map<String, WebSocketSession> sessions = boardSessions.get(boardId);
        if (sessions != null) {
            sessions.remove(session.getId());
            if (sessions.isEmpty()) {
                boardSessions.remove(boardId);
            }
        }
    }

    /**
     * Extract boardId từ URI path
     */
    private String extractBoardIdFromUri(String uri) {
        // URI format: /ws/board/{boardId}
        String[] parts = uri.split("/");
        return parts[parts.length - 1];
    }

    /**
     * Lấy số lượng active sessions cho một board
     */
    public int getActiveSessionCount(String boardId) {
        Map<String, WebSocketSession> sessions = boardSessions.get(boardId);
        return sessions != null ? sessions.size() : 0;
    }
}
