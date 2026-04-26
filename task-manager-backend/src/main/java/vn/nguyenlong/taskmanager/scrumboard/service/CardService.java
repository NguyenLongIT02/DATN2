package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateCardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateCardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateCardCategoryRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.CardDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.*;
import vn.nguyenlong.taskmanager.scrumboard.mapper.ScrumboardMapper;
import vn.nguyenlong.taskmanager.scrumboard.repository.*;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.auth.entity.User;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CardService {

    private final CardRepository cardRepository;
    private final ListRepository listRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final CardMemberRepository cardMemberRepository;
    private final CardLabelRepository cardLabelRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ActivityLogService activityLogService;
    private final vn.nguyenlong.taskmanager.notifications.service.NotificationService notificationService;
    private final vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService webSocketBroadcastService;
    private final ScrumboardMapper scrumboardMapper;
    private final ActivityLogRepository activityLogRepository;
    private final vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository notificationRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;

    @Transactional(readOnly = true)
    public List<CardDto> getCardsByListId(Long listId) {
        List<CardEntity> cards = cardRepository.findByListIdWithMembers(listId);
        return scrumboardMapper.toCardDtoList(cards);
    }

    @Transactional(readOnly = true)
    public CardDto getCardById(Long id) {
        
        // Fetch card with all related data using separate queries to avoid MultipleBagFetchException
        CardEntity card = cardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + id));
        
        // Load related data separately
        cardRepository.findByIdWithMembers(id).ifPresent(c -> {
            card.setMembers(c.getMembers());
        });
        
        cardRepository.findByIdWithLabels(id).ifPresent(c -> {
            card.setLabels(c.getLabels());
        });
        
        cardRepository.findByIdWithAttachments(id).ifPresent(c -> {
            card.setAttachments(c.getAttachments());
        });
        
        cardRepository.findByIdWithComments(id).ifPresent(c -> {
            card.setComments(c.getComments());
        });
        
        
        return scrumboardMapper.toCardDto(card);
    }

    public CardDto createCard(CreateCardRequest request) {
        
        ListEntity list = listRepository.findByIdWithBoard(request.getLaneId())
                .orElseThrow(() -> new NotFoundException("List not found with id: " + request.getLaneId()));

        log.info("Board ID: {}, Name: {}, StartDate: {}, EndDate: {}", 
            list.getBoard().getId(), 
            list.getBoard().getName(),
            list.getBoard().getStartDate(),
            list.getBoard().getEndDate());

        // Validate dueDate against board's startDate and endDate
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            try {
                Instant dueDate = Instant.parse(request.getDate());
                validateDueDateWithinBoardRange(dueDate, list.getBoard());
            } catch (IllegalArgumentException e) {
                // Re-throw validation errors
                throw e;
            } catch (Exception e) {
                log.warn("Invalid date format: {}", request.getDate());
                throw new IllegalArgumentException("Invalid date format: " + request.getDate());
            }
        }

        CardEntity card = new CardEntity();
        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        card.setList(list);
        card.setStatus(request.getStatus() != null ? request.getStatus() : list.getName());
        
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            try {
                card.setDate(Instant.parse(request.getDate()));
            } catch (Exception e) {
                log.warn("Invalid date format: {}", request.getDate());
            }
        }
        
        CardEntity savedCard = cardRepository.save(card);
        
        // Add members if provided
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            addMembersToCard(savedCard.getId(), request.getMemberIds());
        }
        
        // Add labels if provided
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            addLabelsToCard(savedCard.getId(), request.getLabelIds());
        }

        // Add checklist items if provided
        if (request.getChecklistItems() != null && !request.getChecklistItems().isEmpty()) {
            for (String itemTitle : request.getChecklistItems()) {
                ChecklistItemEntity item = ChecklistItemEntity.builder()
                        .title(itemTitle)
                        .checked(false)
                        .card(savedCard)
                        .build();
                checklistItemRepository.save(item);
            }
        }
        
        CardDto cardDto = scrumboardMapper.toCardDto(savedCard);
        
        // Log activity
        Long userId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();
        if (userId != null) {
            activityLogService.logActivity(list.getBoard().getId(), savedCard.getId(), userId, 
                "CARD_CREATED", "đã tạo thẻ: " + savedCard.getTitle());
            
            // Thông báo cho các thành viên trong board
            notificationService.notifyBoardMembers(list.getBoard().getId(), userId, "CARD_CREATED", 
                "notification.card.created.title", "notification.card.created.message", 
                savedCard.getId(), null, savedCard.getTitle(), list.getBoard().getName());
            
            // Broadcast WebSocket
            webSocketBroadcastService.broadcastCardCreated(list.getBoard().getId(), savedCard.getId(), cardDto);
        }
        
        return cardDto;
    }

    public CardDto updateCard(UpdateCardRequest request) {
        
        CardEntity card = cardRepository.findByIdWithListAndBoard(request.getId())
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + request.getId()));

        // Validate dueDate against board's startDate and endDate
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            try {
                Instant dueDate = Instant.parse(request.getDate());
                validateDueDateWithinBoardRange(dueDate, card.getList().getBoard());
            } catch (IllegalArgumentException e) {
                // Re-throw validation errors
                throw e;
            } catch (Exception e) {
                log.warn("Invalid date format: {}", request.getDate());
                throw new IllegalArgumentException("Invalid date format: " + request.getDate());
            }
        }

        card.setTitle(request.getTitle());
        card.setDescription(request.getDescription());
        
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            try {
                card.setDate(Instant.parse(request.getDate()));
            } catch (Exception e) {
                log.warn("Invalid date format: {}", request.getDate());
            }
        }
        
        if (request.getLaneId() != null) {
            ListEntity list = listRepository.findById(request.getLaneId())
                    .orElseThrow(() -> new NotFoundException("List not found with id: " + request.getLaneId()));
            card.setList(list);
        }
        
        String targetStatus = request.getStatus() != null ? request.getStatus() : (card.getList() != null ? card.getList().getName() : card.getStatus());
        validateChecklistItems(card, targetStatus);

        if (request.getStatus() != null) {
            card.setStatus(request.getStatus());
        }
        CardEntity updatedCard = cardRepository.save(card);
        
        // Update members if provided
        if (request.getMemberIds() != null) {
            updateCardMembers(updatedCard.getId(), request.getMemberIds());
        }
        
        // Update labels if provided
        if (request.getLabelIds() != null) {
            updateCardLabels(updatedCard.getId(), request.getLabelIds());
        }
        
        return scrumboardMapper.toCardDto(updatedCard);
    }

    public CardDto updateCardCategory(UpdateCardCategoryRequest request) {
        
        CardEntity card = cardRepository.findById(request.getCardId())
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + request.getCardId()));
        
        ListEntity newList = listRepository.findById(request.getLaneId())
                .orElseThrow(() -> new NotFoundException("List not found with id: " + request.getLaneId()));
        
        Long oldListId = card.getList().getId();
        String oldListName = card.getList().getName();
        
        // Validate checklist if moving to main statuses
        validateChecklistItems(card, newList.getName());
        
        card.setList(newList);
        card.setStatus(newList.getName());
        CardEntity updatedCard = cardRepository.save(card);
        CardDto cardDto = scrumboardMapper.toCardDto(updatedCard);
        
        // Log activity & Notification
        Long userId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();
        if (userId != null) {
            String logDesc = "đã chuyển thẻ '" + updatedCard.getTitle() + "' sang cột: " + newList.getName();
            activityLogService.logActivity(newList.getBoard().getId(), updatedCard.getId(), userId, 
                "CARD_MOVED", logDesc);
            
            // Thông báo chuyển trạng thái (Truyền đủ 4 tham số: Thẻ, Cột cũ, Cột mới, Tên bảng)
            notificationService.notifyBoardMembers(newList.getBoard().getId(), userId, "CARD_MOVED", 
                "notification.card.moved.title", "notification.card.moved.message", 
                updatedCard.getId(), null, updatedCard.getTitle(), oldListName, newList.getName(), newList.getBoard().getName());
            
            // Broadcast WebSocket
            webSocketBroadcastService.broadcastCardMoved(newList.getBoard().getId(), updatedCard.getId(), oldListId, newList.getId(), cardDto);
        }
        
        return cardDto;
    }

    public void deleteCard(Long id) {
        CardEntity card = cardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + id));
        
        Long boardId = card.getList().getBoard().getId();
        String boardName = card.getList().getBoard().getName();
        String cardTitle = card.getTitle();
        
        // Manual cleanup to avoid DB constraint issues
        try {
            activityLogRepository.nullifyCardId(id);
            notificationRepository.deleteByCardId(id);
            commentRepository.deleteByCardId(id);
            cardMemberRepository.deleteByCardId(id);
            cardLabelRepository.deleteByCardId(id);
            attachmentRepository.deleteByCardId(id);
            checklistItemRepository.deleteByCardId(id);
        } catch (Exception e) {
            log.warn("Error during manual card cleanup: {}", e.getMessage());
        }
        
        cardRepository.delete(card);

        // Log activity
        Long userId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();
        if (userId != null) {
            activityLogService.logActivity(boardId, null, userId, 
                "CARD_DELETED", "đã xóa thẻ: " + cardTitle);
            
            // Thông báo xóa card (Truyền Thẻ và Tên dự án)
            notificationService.notifyBoardMembers(boardId, userId, "CARD_DELETED", 
                "notification.card.deleted.title", "notification.card.deleted.message", 
                null, null, cardTitle, boardName);
            
            // Broadcast WebSocket
            webSocketBroadcastService.broadcastCardDeleted(boardId, id);
        }
    }

    private void addMembersToCard(Long cardId, List<Long> memberIds) {
        for (Long memberId : memberIds) {
            if (!cardMemberRepository.existsByCardIdAndUserId(cardId, memberId)) {
                User user = userRepository.findById(memberId)
                        .orElseThrow(() -> new NotFoundException("User not found with id: " + memberId));
                
                CardEntity card = cardRepository.findById(cardId)
                        .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));
                
                CardMemberEntity cardMember = new CardMemberEntity();
                cardMember.setCard(card);
                cardMember.setUser(user);
                cardMemberRepository.save(cardMember);
            }
        }
    }

    private void addLabelsToCard(Long cardId, List<Long> labelIds) {
        for (Long labelId : labelIds) {
            if (!cardLabelRepository.existsByCardIdAndLabelId(cardId, labelId)) {
                LabelEntity label = labelRepository.findById(labelId)
                        .orElseThrow(() -> new NotFoundException("Label not found with id: " + labelId));
                
                CardEntity card = cardRepository.findById(cardId)
                        .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));
                
                CardLabelEntity cardLabel = new CardLabelEntity();
                cardLabel.setCard(card);
                cardLabel.setLabel(label);
                cardLabelRepository.save(cardLabel);
            }
        }
    }

    private void updateCardMembers(Long cardId, List<Long> memberIds) {
        // Remove existing members
        cardMemberRepository.deleteByCardId(cardId);
        
        // Add new members
        if (!memberIds.isEmpty()) {
            addMembersToCard(cardId, memberIds);
        }
    }

    private void updateCardLabels(Long cardId, List<Long> labelIds) {
        // Remove existing labels
        cardLabelRepository.deleteByCardId(cardId);
        
        // Add new labels
        if (!labelIds.isEmpty()) {
            addLabelsToCard(cardId, labelIds);
        }
    }

    private void validateChecklistItems(CardEntity card, String status) {
        if (status == null) return;
        
        String normalizedStatus = status.toLowerCase().trim();
        // Kiểm tra 2 trạng thái chính: "đang làm" và "hoàn thành"
        if (normalizedStatus.equals("đang làm") || normalizedStatus.equals("hoàn thành")) {
            // Load lại checklist để đảm bảo dữ liệu mới nhất
            List<ChecklistItemEntity> checklist = checklistItemRepository.findByCardId(card.getId());
            
            if (checklist != null && !checklist.isEmpty()) {
                boolean hasUnfinished = checklist.stream().anyMatch(item -> !item.isChecked());
                if (hasUnfinished) {
                    throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                        vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_CHECKLIST_INCOMPLETE
                    );
                }
            }
        }
    }
    
    /**
     * Validate that card's dueDate is within board's startDate and endDate range
     */
    private void validateDueDateWithinBoardRange(Instant dueDate, BoardEntity board) {
        if (dueDate == null) {
            return;
        }
        
        Instant boardStart = board.getStartDate();
        Instant boardEnd = board.getEndDate();
        
        log.info("Validating dueDate: {} against board range: start={}, end={}", dueDate, boardStart, boardEnd);
        
        // If board has no date range, allow any dueDate
        if (boardStart == null && boardEnd == null) {
            log.info("Board has no date range, skipping validation");
            return;
        }
        
        // Check if dueDate is before board start date
        if (boardStart != null && dueDate.isBefore(boardStart)) {
            java.time.LocalDate startDate = java.time.LocalDate.ofInstant(boardStart, java.time.ZoneId.systemDefault());
            String errorMsg = "Ngày hết hạn của thẻ phải sau ngày bắt đầu của bảng (" + startDate + ")";
            log.error("Validation failed: {}", errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }
        
        // Check if dueDate is after board end date
        if (boardEnd != null && dueDate.isAfter(boardEnd)) {
            java.time.LocalDate endDate = java.time.LocalDate.ofInstant(boardEnd, java.time.ZoneId.systemDefault());
            String errorMsg = "Ngày hết hạn của thẻ phải trước ngày kết thúc của bảng (" + endDate + ")";
            log.error("Validation failed: {}", errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }
        
        log.info("DueDate validation passed");
    }
}
