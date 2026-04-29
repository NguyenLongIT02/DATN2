package vn.nguyenlong.taskmanager.scrumboard.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddDependenciesRequest {
    @NotNull(message = "Predecessor IDs are required")
    @NotEmpty(message = "At least one predecessor ID is required")
    private List<Long> predecessorIds;
}
