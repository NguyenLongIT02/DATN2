package vn.nguyenlong.taskmanager.scrumboard.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InviteRequestDto {

    @NotBlank
    @Email
    private String email;
}


