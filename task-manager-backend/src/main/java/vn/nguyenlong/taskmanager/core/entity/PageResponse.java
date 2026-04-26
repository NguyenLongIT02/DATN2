package vn.nguyenlong.taskmanager.core.entity;


import lombok.Getter;
import lombok.ToString;
import vn.nguyenlong.taskmanager.core.util.BaseResponse;

import java.util.List;

@Getter
@ToString(callSuper = true)
public class PageResponse<T> extends BaseResponse {
    private final List<T> content;
    private final int page;
    private final int size;
    private final long total;

    public PageResponse(List<T> content, int page, int size, long total, Integer code) {
        super(true, "success", code);
        this.content = content;
        this.page = page;
        this.size = size;
        this.total = total;
    }

//    public PageResponse(List<T> content, int page, int size, long total, String message, Integer code) {
//        super(true, message, code);
//        this.content = content;
//        this.page = page;
//        this.size = size;
//        this.total = total;
//    }
}
