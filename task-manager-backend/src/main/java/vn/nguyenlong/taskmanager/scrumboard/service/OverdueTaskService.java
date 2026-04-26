package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository;
import vn.nguyenlong.taskmanager.notifications.service.NotificationService;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardMemberEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OverdueTaskService {

    private final CardRepository cardRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    /**
     * Chạy mỗi phút để kiểm tra các card quá hạn (để test)
     * 0 * * * * * = Giây 0 của mỗi phút
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkOverdueCards() {
        log.info("Starting overdue cards check...");
        Instant now = Instant.now();
        List<CardEntity> overdueCards = cardRepository.findOverdueCards(now);
        
        log.info("Found {} overdue cards", overdueCards.size());
        
        for (CardEntity card : overdueCards) {
            notifyOverdue(card);
        }
    }

    private void notifyOverdue(CardEntity card) {
        Long boardId = card.getList().getBoard().getId();
        Long cardId = card.getId();
        
        // Gửi thông báo cho từng thành viên của card
        if (card.getMembers() != null && !card.getMembers().isEmpty()) {
            for (CardMemberEntity member : card.getMembers()) {
                Long recipientId = member.getUser().getId();
                
                // Tránh gửi thông báo lặp lại nếu đã có thông báo quá hạn cho card này
                if (notificationRepository.existsByUserIdAndCardIdAndType(recipientId, cardId, "CARD_OVERDUE")) {
                    continue;
                }

                try {
                    // Sử dụng ID 1 (Admin/System) làm actor cho thông báo hệ thống
                    Long actorId = 1L; 
                    
                    notificationService.createNotification(
                        "CARD_OVERDUE",
                        "notification.card.overdue.title",
                        "notification.card.overdue.message",
                        recipientId,
                        boardId,
                        cardId,
                        actorId,
                        "{\"overdue\": true}",
                        card.getTitle()
                    );
                } catch (Exception e) {
                    log.error("Failed to notify user {} about overdue card {}: {}", 
                        recipientId, cardId, e.getMessage());
                }
            }
        }
    }
}
