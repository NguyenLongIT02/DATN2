package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.ActivityLogDto;
import vn.nguyenlong.taskmanager.scrumboard.service.ActivityLogService;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/scrumboard/activity")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Activity Log Controller", description = "API endpoints for board and card activity logs")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping("/board/{boardId}")
    @Operation(summary = "Get activity logs for a board")
    public SuccessResponse<List<ActivityLogDto>> getBoardActivityLogs(
            @Parameter(description = "Board ID") @PathVariable Long boardId) {
        return ResponseUtil.ok(HttpStatus.OK.value(), "Success", activityLogService.getBoardActivityLogs(boardId));
    }

    @GetMapping("/card/{cardId}")
    @Operation(summary = "Get activity logs for a card")
    public SuccessResponse<List<ActivityLogDto>> getCardActivityLogs(
            @Parameter(description = "Card ID") @PathVariable Long cardId) {
        return ResponseUtil.ok(HttpStatus.OK.value(), "Success", activityLogService.getCardActivityLogs(cardId));
    }
}
