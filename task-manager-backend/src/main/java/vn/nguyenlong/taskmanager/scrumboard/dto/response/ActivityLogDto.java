package vn.nguyenlong.taskmanager.scrumboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDto {
    private Long id;
    private Long boardId;
    private Long cardId;
    private Long userId;
    private String username;
    private String userFullName;
    private String userAvatar;
    private String actionType;
    private String description;
    private Instant createdAt;
}
