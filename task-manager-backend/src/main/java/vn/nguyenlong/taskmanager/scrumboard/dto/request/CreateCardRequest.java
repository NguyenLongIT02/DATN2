package vn.nguyenlong.taskmanager.scrumboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCardRequest {
    @NotBlank(message = MessageKeys.CARD_TITLE_REQUIRED)
    @Size(max = 255, message = MessageKeys.CARD_TITLE_SIZE)
    private String title;

    private String description;
    private String date;
    private String status;

    @NotNull(message = MessageKeys.LANE_ID_REQUIRED)
    private Long laneId;

    private List<Long> memberIds;
    private List<Long> labelIds;
    private List<String> checklistItems;

    // Manual Builder-like methods for compatibility if needed
    public static CreateCardRequestBuilder builder() {
        return new CreateCardRequestBuilder();
    }

    public static class CreateCardRequestBuilder {
        private String title;
        private String description;
        private String date;
        private String status;
        private Long laneId;
        private List<Long> memberIds;
        private List<Long> labelIds;
        private List<String> checklistItems;

        public CreateCardRequestBuilder title(String title) { this.title = title; return this; }
        public CreateCardRequestBuilder description(String description) { this.description = description; return this; }
        public CreateCardRequestBuilder date(String date) { this.date = date; return this; }
        public CreateCardRequestBuilder status(String status) { this.status = status; return this; }
        public CreateCardRequestBuilder laneId(Long laneId) { this.laneId = laneId; return this; }
        public CreateCardRequestBuilder memberIds(List<Long> memberIds) { this.memberIds = memberIds; return this; }
        public CreateCardRequestBuilder labelIds(List<Long> labelIds) { this.labelIds = labelIds; return this; }
        public CreateCardRequestBuilder checklistItems(List<String> checklistItems) { this.checklistItems = checklistItems; return this; }

        public CreateCardRequest build() {
            return new CreateCardRequest(title, description, date, status, laneId, memberIds, labelIds, checklistItems);
        }
    }
}
