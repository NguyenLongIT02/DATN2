package vn.nguyenlong.taskmanager.notifications.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.component.TranslateMessage;
import vn.nguyenlong.taskmanager.core.entity.PageResponse;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.notifications.dto.response.NotificationDto;
import vn.nguyenlong.taskmanager.notifications.service.NotificationService;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Controller", description = "API endpoints for notification management")
public class NotificationController {

    private final NotificationService notificationService;
    private final TranslateMessage translateMessage;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get notifications by user ID", description = "Retrieve paginated notifications for authenticated user")
    public PageResponse<NotificationDto> getNotificationsByUserId(
            Principal principal,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        Long userId = extractUserIdFromPrincipal(principal);
        log.info("GET /api/notifications?page={}&size={} - Fetching notifications for user {}", 
                page, size, userId);
        Page<NotificationDto> notifications = notificationService.getNotificationsByUserId(userId, page, size);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                notifications);
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieve all unread notifications for authenticated user")
    public SuccessResponse<List<NotificationDto>> getUnreadNotifications(Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        log.info("GET /api/notifications/unread - Fetching unread notifications for user {}", userId);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.NOTIFICATION_GET_SUCCESS),
                notificationService.getUnreadNotificationsByUserId(userId));
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread notification count", description = "Get the count of unread notifications for authenticated user")
    public SuccessResponse<Long> getUnreadNotificationCount(Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        log.info("GET /api/notifications/count - Getting unread notification count for user {}", userId);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.NOTIFICATION_GET_SUCCESS),
                notificationService.getUnreadNotificationCount(userId));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    public SuccessResponse<String> markNotificationAsRead(
            @Parameter(description = "Notification ID") @PathVariable Long id) {
        log.info("PUT /api/notifications/{}/read - Marking notification as read", id);
        notificationService.markNotificationAsRead(id);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.NOTIFICATION_MARK_READ_SUCCESS));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications as read for authenticated user")
    public SuccessResponse<String> markAllNotificationsAsRead(Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        log.info("PUT /api/notifications/read-all - Marking all notifications as read for user {}", userId);
        notificationService.markAllNotificationsAsRead(userId);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.NOTIFICATION_MARK_ALL_READ_SUCCESS));
    }

    @PutMapping("/clear-all")
    @Operation(summary = "Clear all notifications", description = "Delete all notifications for authenticated user")
    public SuccessResponse<String> clearAllNotifications(Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        log.info("PUT /api/notifications/clear-all - Clearing all notifications for user {}", userId);
        notificationService.clearAllNotifications(userId);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.NOTIFICATION_CLEAR_ALL_SUCCESS));
    }
    
    private Long extractUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        String username = principal.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username))
                .getId();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    public SuccessResponse<String> deleteNotification(
            @Parameter(description = "Notification ID") @PathVariable Long id) {
        log.info("DELETE /api/notifications/{} - Deleting notification", id);
        notificationService.deleteNotification(id);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.NOTIFICATION_DELETE_SUCCESS));
    }
}
