package vn.nguyenlong.taskmanager.websocket.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WebSocketMessage {
    
    private String type;
    private String boardId;
    private String cardId;
    private String listId;
    private String fromListId;
    private String toListId;
    private Object data;
    private LocalDateTime timestamp;
    private Map<String, Object> metadata;
    
    // Factory methods cho các loại message phổ biến
    public static WebSocketMessage cardUpdated(String boardId, String cardId, Object cardData) {
        return WebSocketMessage.builder()
                .type("CARD_UPDATED")
                .boardId(boardId)
                .cardId(cardId)
                .data(cardData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static WebSocketMessage cardMoved(String boardId, String cardId, String fromListId, String toListId, Object cardData) {
        return WebSocketMessage.builder()
                .type("CARD_MOVED")
                .boardId(boardId)
                .cardId(cardId)
                .fromListId(fromListId)
                .toListId(toListId)
                .data(cardData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static WebSocketMessage cardCreated(String boardId, String cardId, Object cardData) {
        return WebSocketMessage.builder()
                .type("CARD_CREATED")
                .boardId(boardId)
                .cardId(cardId)
                .data(cardData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static WebSocketMessage cardDeleted(String boardId, String cardId) {
        return WebSocketMessage.builder()
                .type("CARD_DELETED")
                .boardId(boardId)
                .cardId(cardId)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    // Factory methods cho List operations
    public static WebSocketMessage listCreated(String boardId, String listId, Object listData) {
        return WebSocketMessage.builder()
                .type("LIST_CREATED")
                .boardId(boardId)
                .listId(listId)
                .data(listData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static WebSocketMessage listUpdated(String boardId, String listId, Object listData) {
        return WebSocketMessage.builder()
                .type("LIST_UPDATED")
                .boardId(boardId)
                .listId(listId)
                .data(listData)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static WebSocketMessage listDeleted(String boardId, String listId) {
        return WebSocketMessage.builder()
                .type("LIST_DELETED")
                .boardId(boardId)
                .listId(listId)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
}
