package vn.nguyenlong.taskmanager.core.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Builder
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {
    private final boolean status = false;
    private String path;
    private Object message;
    private Integer code;
    private Instant timestamp;
}
