package vn.nguyenlong.taskmanager.websocket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.nguyenlong.taskmanager.websocket.dto.WebSocketMessage;
import vn.nguyenlong.taskmanager.websocket.handler.BoardWebSocketHandler;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketBroadcastService {

    private final BoardWebSocketHandler boardWebSocketHandler;

    /**
     * Broadcast khi card được update
     */
    public void broadcastCardUpdated(Long boardId, Long cardId, Object cardData) {
        try {
            WebSocketMessage message = WebSocketMessage.cardUpdated(
                    String.valueOf(boardId), 
                    String.valueOf(cardId), 
                    cardData
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted card updated event for board: {}, card: {}", boardId, cardId);
        } catch (Exception e) {
            log.error("Error broadcasting card updated event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi card được move giữa các list
     */
    public void broadcastCardMoved(Long boardId, Long cardId, Long fromListId, Long toListId, Object cardData) {
        try {
            WebSocketMessage message = WebSocketMessage.cardMoved(
                    String.valueOf(boardId),
                    String.valueOf(cardId),
                    String.valueOf(fromListId),
                    String.valueOf(toListId),
                    cardData
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted card moved event for board: {}, card: {} from list: {} to list: {}", 
                    boardId, cardId, fromListId, toListId);
        } catch (Exception e) {
            log.error("Error broadcasting card moved event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi card được tạo mới
     */
    public void broadcastCardCreated(Long boardId, Long cardId, Object cardData) {
        try {
            WebSocketMessage message = WebSocketMessage.cardCreated(
                    String.valueOf(boardId),
                    String.valueOf(cardId),
                    cardData
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted card created event for board: {}, card: {}", boardId, cardId);
        } catch (Exception e) {
            log.error("Error broadcasting card created event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi card bị xóa
     */
    public void broadcastCardDeleted(Long boardId, Long cardId) {
        try {
            WebSocketMessage message = WebSocketMessage.cardDeleted(
                    String.valueOf(boardId),
                    String.valueOf(cardId)
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted card deleted event for board: {}, card: {}", boardId, cardId);
        } catch (Exception e) {
            log.error("Error broadcasting card deleted event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast custom message
     */
    public void broadcastCustomMessage(Long boardId, String messageType, Object data) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .type(messageType)
                    .boardId(String.valueOf(boardId))
                    .data(data)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted custom message for board: {}, type: {}", boardId, messageType);
        } catch (Exception e) {
            log.error("Error broadcasting custom message: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi có comment mới vào card
     */
    public void broadcastCardCommented(Long boardId, Long cardId, Object commentData) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .type("CARD_COMMENTED")
                    .boardId(String.valueOf(boardId))
                    .cardId(String.valueOf(cardId))
                    .data(commentData)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted card commented event for board: {}, card: {}", boardId, cardId);
        } catch (Exception e) {
            log.error("Error broadcasting card commented event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi checklist của card được update
     */
    public void broadcastCardChecklistUpdated(Long boardId, Long cardId, Object checklistData) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .type("CARD_CHECKLIST_UPDATED")
                    .boardId(String.valueOf(boardId))
                    .cardId(String.valueOf(cardId))
                    .data(checklistData)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted card checklist updated event for board: {}, card: {}", boardId, cardId);
        } catch (Exception e) {
            log.error("Error broadcasting card checklist updated event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi list được tạo mới
     */
    public void broadcastListCreated(Long boardId, Long listId, Object listData) {
        try {
            WebSocketMessage message = WebSocketMessage.listCreated(
                    String.valueOf(boardId),
                    String.valueOf(listId),
                    listData
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted list created event for board: {}, list: {}", boardId, listId);
        } catch (Exception e) {
            log.error("Error broadcasting list created event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi list được update
     */
    public void broadcastListUpdated(Long boardId, Long listId, Object listData) {
        try {
            WebSocketMessage message = WebSocketMessage.listUpdated(
                    String.valueOf(boardId),
                    String.valueOf(listId),
                    listData
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted list updated event for board: {}, list: {}", boardId, listId);
        } catch (Exception e) {
            log.error("Error broadcasting list updated event: {}", e.getMessage());
        }
    }

    /**
     * Broadcast khi list bị xóa
     */
    public void broadcastListDeleted(Long boardId, Long listId) {
        try {
            WebSocketMessage message = WebSocketMessage.listDeleted(
                    String.valueOf(boardId),
                    String.valueOf(listId)
            );
            boardWebSocketHandler.broadcastToBoard(String.valueOf(boardId), message);
            log.info("Broadcasted list deleted event for board: {}, list: {}", boardId, listId);
        } catch (Exception e) {
            log.error("Error broadcasting list deleted event: {}", e.getMessage());
        }
    }

    /**
     * Lấy số lượng active connections cho một board
     */
    public int getActiveConnectionCount(Long boardId) {
        return boardWebSocketHandler.getActiveSessionCount(String.valueOf(boardId));
    }
}
