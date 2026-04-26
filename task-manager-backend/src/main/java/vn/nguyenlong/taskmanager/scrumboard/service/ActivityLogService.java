package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.ActivityLogDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.ActivityLogEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.ActivityLogRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getBoardActivityLogs(Long boardId) {
        List<ActivityLogEntity> logs = activityLogRepository.findByBoardIdOrderByCreatedAtDesc(boardId);
        return logs.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogDto> getCardActivityLogs(Long cardId) {
        List<ActivityLogEntity> logs = activityLogRepository.findByCardIdOrderByCreatedAtDesc(cardId);
        return logs.stream().map(this::toDto).collect(Collectors.toList());
    }

    // Use REQUIRES_NEW to ensure log is saved even if outer transaction fails, or standard REQUIRED
    @Transactional(propagation = Propagation.REQUIRED)
    public void logActivity(Long boardId, Long cardId, Long userId, String actionType, String description) {
        try {
            BoardEntity board = boardRepository.findById(boardId).orElse(null);
            if (board == null) return;

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            CardEntity card = null;
            if (cardId != null) {
                card = cardRepository.findById(cardId).orElse(null);
            }

            ActivityLogEntity logEntity = ActivityLogEntity.builder()
                    .board(board)
                    .card(card)
                    .user(user)
                    .actor(user)
                    .actionType(actionType)
                    .description(description)
                    .build();

            activityLogRepository.save(logEntity);
        } catch (Exception e) {
            log.error("Failed to save activity log: {}", e.getMessage(), e);
        }
    }

    private ActivityLogDto toDto(ActivityLogEntity entity) {
        return ActivityLogDto.builder()
                .id(entity.getId())
                .boardId(entity.getBoard().getId())
                .cardId(entity.getCard() != null ? entity.getCard().getId() : null)
                .userId(entity.getUser().getId())
                .username(entity.getUser().getUsername())
                .userFullName(entity.getUser().getFullName())
                .userAvatar(entity.getUser().getProfileImageUrl())
                .actionType(entity.getActionType())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
