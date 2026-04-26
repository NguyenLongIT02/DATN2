package vn.nguyenlong.taskmanager.scrumboard.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.nguyenlong.taskmanager.util.MessageKeys;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCardCategoryRequest {
    @NotNull(message = MessageKeys.CARD_ID_REQUIRED)
    private Long cardId;

    @NotNull(message = MessageKeys.LANE_ID_REQUIRED)
    private Long laneId;
}
