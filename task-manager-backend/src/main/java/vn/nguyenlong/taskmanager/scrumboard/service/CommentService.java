package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateCommentRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.CommentDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CommentEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.CommentRepository;
import vn.nguyenlong.taskmanager.scrumboard.mapper.ScrumboardMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;
    private final vn.nguyenlong.taskmanager.notifications.service.NotificationService notificationService;
    private final vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService webSocketBroadcastService;
    private final ScrumboardMapper scrumboardMapper;

    @Transactional(readOnly = true)
    public List<CommentDto> getCommentsByCardId(Long cardId) {
        List<CommentEntity> comments = commentRepository.findByCardIdWithUserOrderByCreatedAtAsc(cardId);
        return comments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CommentDto createComment(CreateCommentRequest request, Long userId) {
        log.info("Creating comment by user {} for card {}: {}", userId, request.getCardId(), request.getContent());
        
        try {
            CardEntity card = cardRepository.findByIdWithListAndBoard(request.getCardId())
                    .orElseThrow(() -> new NotFoundException("Card not found with id: " + request.getCardId()));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));

            CommentEntity comment = new CommentEntity();
            comment.setCard(card);
            comment.setUser(user);
            comment.setContent(request.getContent());

            log.info("Saving comment entity...");
            CommentEntity saved = commentRepository.save(comment);
            // Flush to ensure JPA populates createdAt/id and triggers any constraint violations
            commentRepository.flush();
            
            log.info("Comment saved successfully with id: {}", saved.getId());
            
            // Log activity & Notification
            try {
                if (card.getList() != null && card.getList().getBoard() != null) {
                    Long boardId = card.getList().getBoard().getId();
                    
                    activityLogService.logActivity(boardId, card.getId(), userId, "ADD_COMMENT", 
                        "đã bình luận vào thẻ '" + card.getTitle() + "': " + request.getContent());
                    
                    notificationService.notifyBoardMembers(boardId, userId, "CARD_COMMENTED", 
                        "notification.card.commented.title", "notification.card.commented.message", 
                        card.getId(), null, card.getTitle(), request.getContent());
                    
                    // Broadcast WebSocket
                    webSocketBroadcastService.broadcastCardCommented(boardId, card.getId(), toDto(saved));
                } else {
                    log.warn("Card {} does not have associated list/board. Skipping log/notification.", card.getId());
                }
            } catch (Exception e) {
                log.error("Error in post-comment activities (log/notify/ws): {}", e.getMessage());
                // Don't fail the whole request if log/notify fails
            }

            return toDto(saved);
        } catch (NotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("CRITICAL ERROR adding comment: {} - {}", e.getClass().getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("Lỗi hệ thống khi thêm bình luận: " + e.getMessage());
        }
    }

    public void deleteComment(Long commentId, Long userId) {
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Comment not found with id: " + commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentDto toDto(CommentEntity entity) {
        if (entity == null) return null;
        
        CommentDto.CommentDtoBuilder builder = CommentDto.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt() : java.time.Instant.now());

        if (entity.getCard() != null) {
            builder.cardId(entity.getCard().getId());
        }

        if (entity.getUser() != null) {
            builder.userId(entity.getUser().getId())
                    .username(entity.getUser().getUsername())
                    .userFullName(entity.getUser().getFullName())
                    .userAvatar(entity.getUser().getProfileImageUrl());
        }

        return builder.build();
    }
}
