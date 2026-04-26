package vn.nguyenlong.taskmanager.scrumboard.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InvitationPayloadDto {
    private String email;
    private Long boardId;
    private String boardName;
    private Long invitedById;
    private Long roleId;
}


