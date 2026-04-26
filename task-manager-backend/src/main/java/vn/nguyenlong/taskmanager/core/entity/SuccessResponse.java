package vn.nguyenlong.taskmanager.core.entity;

import lombok.Getter;
import lombok.ToString;
import vn.nguyenlong.taskmanager.core.util.BaseResponse;

@Getter
@ToString(callSuper = true)
public class SuccessResponse<T> extends BaseResponse {
    private final T data;

    public SuccessResponse(T data, Integer code) {
        super(true, "success", code);
        this.data = data;
    }

    public SuccessResponse(T data, String message, Integer code) {
        super(true, message, code);
        this.data = data;
    }
}
