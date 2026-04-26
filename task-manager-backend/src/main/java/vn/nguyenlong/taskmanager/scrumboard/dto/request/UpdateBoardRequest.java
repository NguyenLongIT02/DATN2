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
public class UpdateBoardRequest {
    @NotNull(message = MessageKeys.BOARD_ID_REQUIRED)
    private Long id;

    @NotBlank(message = MessageKeys.BOARD_NAME_REQUIRED)
    @Size(max = 255, message = MessageKeys.BOARD_NAME_SIZE)
    private String name;
    
    private String startDate;
    private String endDate;
}
