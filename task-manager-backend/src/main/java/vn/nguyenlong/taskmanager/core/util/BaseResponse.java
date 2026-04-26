package vn.nguyenlong.taskmanager.core.util;

import lombok.Getter;
import lombok.ToString;

import java.time.Instant;

@Getter
@ToString
public class BaseResponse {
    private final Boolean status;
    private final String message;
    private final Instant timestamp;
    private final Integer code;

    public BaseResponse(Boolean status, String message, Integer code) {
        this.status = status;
        this.message = message;
        this.code = code;
        this.timestamp = Instant.now();
    }
}
