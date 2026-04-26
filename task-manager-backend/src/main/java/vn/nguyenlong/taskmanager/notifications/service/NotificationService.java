package vn.nguyenlong.taskmanager.notifications.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.notifications.dto.response.NotificationDto;
import vn.nguyenlong.taskmanager.notifications.entity.NotificationEntity;
import vn.nguyenlong.taskmanager.notifications.mapper.NotificationMapper;
import vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardMemberEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardMemberRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final NotificationMapper notificationMapper;
    private final vn.nguyenlong.taskmanager.websocket.handler.NotificationWebSocketHandler notificationWebSocketHandler;
    private final vn.nguyenlong.taskmanager.core.component.LocalizationComponent localizationComponent;

    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotificationsByUserId(Long userId, int page, int size) {
        log.info("Fetching notifications for user {} with pagination: page={}, size={}", userId, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationEntity> notifications = notificationRepository.findByUserIdWithActor(userId, pageable);
        return notifications.map(notificationMapper::toNotificationDto);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotificationsByUserId(Long userId) {
        log.info("Fetching unread notifications for user {}", userId);
        List<NotificationEntity> notifications = notificationRepository.findUnreadByUserId(userId);
        return notificationMapper.toNotificationDtoList(notifications);
    }

    @Transactional(readOnly = true)
    public Long getUnreadNotificationCount(Long userId) {
        log.info("Getting unread notification count for user {}", userId);
        return notificationRepository.countUnreadByUserId(userId);
    }

    public void markNotificationAsRead(Long notificationId) {
        log.info("Marking notification {} as read", notificationId);
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        notificationRepository.save(notification);
        log.info("Notification marked as read successfully");
    }

    public void markAllNotificationsAsRead(Long userId) {
        log.info("Marking all notifications as read for user {}", userId);
        List<NotificationEntity> unreadNotifications = notificationRepository.findUnreadByUserId(userId);

        for (NotificationEntity notification : unreadNotifications) {
            notification.setIsRead(true);
        }

        notificationRepository.saveAll(unreadNotifications);
        log.info("All notifications marked as read successfully");
    }

    public void clearAllNotifications(Long userId) {
        log.info("Clearing all notifications for user {}", userId);
        notificationRepository.deleteAllByUserId(userId);
        log.info("All notifications cleared successfully for user {}", userId);
    }

    public void createNotification(String type, String titleKey, String messageKey, Long userId,
                                 Long boardId, Long cardId, Long actorId, String metadata, Object... messageParams) {
        log.info("Creating notification: type={}, titleKey={}, userId={}", type, titleKey, userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new NotFoundException("Actor not found with id: " + actorId));

        // Translate title and message using i18n keys
        String title = localizationComponent.getLocalizedMessage(titleKey);
        String message = localizationComponent.getLocalizedMessage(messageKey, messageParams);

        NotificationEntity notification = new NotificationEntity();
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setUser(user);
        notification.setActor(actor);
        notification.setIsRead(false);
        // Xử lý metadata cho JSONB
        if (metadata != null) {
            notification.setMetadata(metadata);
        } else {
            notification.setMetadata("{}"); // Empty JSON object
        }

        if (boardId != null) {
            BoardEntity board = boardRepository.findById(boardId)
                    .orElseThrow(() -> new NotFoundException("Board not found with id: " + boardId));
            notification.setBoard(board);
        }

        if (cardId != null) {
            CardEntity card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));
            notification.setCard(card);
        }

        NotificationEntity savedNotification = notificationRepository.save(notification);
        log.info("Notification created successfully with id: {}", savedNotification.getId());

        // Push notification via WebSocket
        try {
            NotificationDto notificationDto = notificationMapper.toNotificationDto(savedNotification);
            vn.nguyenlong.taskmanager.websocket.dto.WebSocketMessage wsMessage = vn.nguyenlong.taskmanager.websocket.dto.WebSocketMessage.builder()
                    .type("NOTIFICATION_CREATED")
                    .data(notificationDto)
                    .timestamp(java.time.LocalDateTime.now())
                    .build();

            notificationWebSocketHandler.sendNotificationToUser(userId, wsMessage);
            log.info("Notification pushed via WebSocket to user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket: {}", e.getMessage(), e);
            // Don't fail the entire operation if WebSocket push fails
        }
    }

    public void notifyBoardMembers(Long boardId,
                                   Long actorId,
                                   String type,
                                   String titleKey,
                                   String messageKey,
                                   Long cardId,
                                   String metadata,
                                   Object... messageParams) {
        List<BoardMemberEntity> boardMembers = boardMemberRepository.findActiveByBoardId(boardId);
        if (boardMembers.isEmpty()) {
            log.info("No active board members found for board {} to receive notification type {}", boardId, type);
            return;
        }

        for (BoardMemberEntity boardMember : boardMembers) {
            Long recipientUserId = boardMember.getUser().getId();
            try {
                createNotification(type, titleKey, messageKey, recipientUserId, boardId, cardId, actorId, metadata, messageParams);
            } catch (Exception e) {
                log.error("Failed to create notification {} for user {} on board {}: {}",
                        type, recipientUserId, boardId, e.getMessage(), e);
            }
        }
    }

    public void deleteNotification(Long notificationId) {
        log.info("Deleting notification with id: {}", notificationId);

        if (!notificationRepository.existsById(notificationId)) {
            throw new NotFoundException("Notification not found with id: " + notificationId);
        }

        notificationRepository.deleteById(notificationId);
        log.info("Notification deleted successfully");
    }
}

