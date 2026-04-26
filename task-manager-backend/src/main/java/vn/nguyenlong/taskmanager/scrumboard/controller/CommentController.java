package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateCommentRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.CommentDto;
import vn.nguyenlong.taskmanager.scrumboard.service.CommentService;
import vn.nguyenlong.taskmanager.scrumboard.service.ActivityLogService;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/scrumboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Comment Controller", description = "API endpoints for card comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final WebSocketBroadcastService webSocketBroadcastService;
    private final ActivityLogService activityLogService;

    @GetMapping("/cards/{cardId}/comments")
    @Operation(summary = "Get comments by card ID")
    public SuccessResponse<List<CommentDto>> getCommentsByCardId(
            @Parameter(description = "Card ID") @PathVariable Long cardId) {
        return ResponseUtil.ok(HttpStatus.OK.value(), "Success", commentService.getCommentsByCardId(cardId));
    }

    @PostMapping("/comments")
    @Operation(summary = "Create new comment")
    public SuccessResponse<CommentDto> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        CommentDto createdComment = commentService.createComment(request, userId);

        return ResponseUtil.ok(HttpStatus.CREATED.value(), "Comment created successfully", createdComment);
    }

    @DeleteMapping("/comments/{id}")
    @Operation(summary = "Delete comment")
    public SuccessResponse<String> deleteComment(
            @Parameter(description = "Comment ID") @PathVariable Long id,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        commentService.deleteComment(id, userId);
        return ResponseUtil.ok(HttpStatus.OK.value(), "Comment deleted successfully");
    }

    private Long extractUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        try {
            String username = principal.getName();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username))
                    .getId();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid user authentication: " + e.getMessage());
        }
    }
}
