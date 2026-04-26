package vn.nguyenlong.taskmanager.scrumboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteRequestDto {

    @NotBlank
    @Email
    private String email;

    /**
     * Vai trò được gán cho người được mời: "Team Lead" hoặc "Member".
     * Mặc định là "Member" nếu không chỉ định.
     */
    private String roleName;
}


