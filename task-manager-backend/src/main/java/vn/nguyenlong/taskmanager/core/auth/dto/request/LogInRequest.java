package vn.nguyenlong.taskmanager.core.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.io.Serializable;

@Getter
public class LogInRequest implements Serializable {

    @NotBlank(message = MessageKeys.USERNAME_REQUIRED)
    private String username;

    @NotBlank(message = MessageKeys.PASSWORD_INVALID)
    private String password;
}
