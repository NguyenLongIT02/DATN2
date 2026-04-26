package vn.nguyenlong.taskmanager.scrumboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiBoardChatResponseDto {

    private String boardName;
    private Boolean aiConfigured;
    private Boolean aiUsed;
    private String provider;
    private String model;
    private String generatedAt;
    private String answer;
    private String fallbackReason;
    private List<Long> referencedCardIds;
    private List<Long> referencedUserIds;
    private List<String> referencedListNames;

    // AI Agentic commands
    private List<ActionCommandDto> actionCommands;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionCommandDto {
        private String type; // e.g., "CREATE_CARD"
        private Object payload;
        private boolean executed;
        private String resultMessage;
    }
}
