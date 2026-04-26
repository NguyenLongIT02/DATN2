package vn.nguyenlong.taskmanager.scrumboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.nguyenlong.taskmanager.util.MessageKeys;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateListRequest {
    @NotBlank(message = MessageKeys.LIST_NAME_REQUIRED)
    @Size(max = 255, message = MessageKeys.LIST_NAME_SIZE)
    private String name;

    @NotNull(message = MessageKeys.BOARD_ID_REQUIRED)
    private Long boardId;
}
