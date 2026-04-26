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
public class CardDto {
    private Long id;
    private String title;
    private List<AttachmentDto> attachments;
    private List<LabelDto> label;
    private String date;
    private List<CommentDto> comments;
    private String desc;
    private String status;
    private List<MemberDto> members;
    private List<ChecklistDto> checkedList;
    private Long laneId;
}
