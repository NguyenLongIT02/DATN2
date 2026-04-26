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
public class AiBoardSuggestionDto {

    private String boardName;
    private Boolean aiConfigured;
    private Boolean aiUsed;
    private String provider;
    private String model;
    private String generatedAt;
    private String summary;
    private List<String> nextActions;
    private String fallbackReason;
    private List<PriorityItem> priorities;
    private List<RiskItem> risks;
    private List<AssignmentItem> assignments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriorityItem {
        private Long cardId;
        private String cardTitle;
        private String listName;
        private Integer score;
        private String reason;
        private String dueDate;
        private Integer assigneeCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskItem {
        private Long cardId;
        private String cardTitle;
        private String listName;
        private Integer score;
        private String severity;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentItem {
        private Long cardId;
        private String cardTitle;
        private String listName;
        private Long suggestedUserId;
        private String suggestedUserName;
        private Integer currentLoad;
        private String reason;
    }
}
