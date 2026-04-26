package vn.nguyenlong.taskmanager.core.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.io.Serializable;

@Getter
public class RegisterRequest implements Serializable {

    @NotBlank(message = MessageKeys.USERNAME_REQUIRED)
    @Size(min = 4, max = 20, message = MessageKeys.USERNAME_SIZE)
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = MessageKeys.USERNAME_PATTERN)
    private String username;

    private String full_name;

    @Email(message = MessageKeys.EMAIL_INVALID)
    private String email;

    @NotBlank(message = MessageKeys.PASSWORD_REQUIRED)
    @Pattern(regexp = "\\S+", message = MessageKeys.PASSWORD_NO_SPACE)
    private String password;
}
