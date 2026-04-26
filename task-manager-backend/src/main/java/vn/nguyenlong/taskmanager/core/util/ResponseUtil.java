package vn.nguyenlong.taskmanager.core.util;

import org.springframework.data.domain.Page;
import vn.nguyenlong.taskmanager.core.entity.PageResponse;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;

import java.util.List;

public class ResponseUtil {

    //==================== SUCCESS ====================
    public static <T> SuccessResponse<T> ok(Integer code, T data) {
        return new SuccessResponse<>(data, code);
    }

    public static <T> SuccessResponse<T> ok(Integer code,String message, T data) {
        return new SuccessResponse<>(data,message, code);
    }

    //==================== PAGE RESPONSE ====================
    public static <T> PageResponse<T> ok(Integer code, Page<T> pageData) {
        return new PageResponse<>(
                pageData.getContent(),
                pageData.getNumber(),
                pageData.getSize(),
                pageData.getTotalElements(),
                code
        );
    }

    public static <T> PageResponse<T> ok(Integer code, List<T> content, int page, int size, long total) {
        return new PageResponse<>(content, page, size, total, code);
    }


}
