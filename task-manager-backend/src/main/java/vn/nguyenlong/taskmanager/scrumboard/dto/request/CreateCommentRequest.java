package vn.nguyenlong.taskmanager.scrumboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    
    @NotNull(message = "Card ID is required")
    private Long cardId;
    
    @NotBlank(message = "Content cannot be empty")
    private String content;
}
