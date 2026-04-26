package vn.nguyenlong.taskmanager.notifications.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Long userId;
    private Long boardId;
    private Long cardId;
    private Long memberId;
    private Long actorId;
    private String actorName;
    private String actorAvatar;
    private Boolean isRead;
    private String createdAt;
    private Object metadata;
}
