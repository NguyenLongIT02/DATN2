package vn.nguyenlong.taskmanager.scrumboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCardRequest {
    @NotNull(message = MessageKeys.CARD_ID_REQUIRED)
    private Long id;

    @NotBlank(message = MessageKeys.CARD_TITLE_REQUIRED)
    @Size(max = 255, message = MessageKeys.CARD_TITLE_SIZE)
    private String title;

    private String description;
    private String date;
    private String status;
    private Long laneId;
    private List<Long> memberIds;
    private List<Long> labelIds;
}
