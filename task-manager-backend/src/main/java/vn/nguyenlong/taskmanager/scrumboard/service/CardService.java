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
    private final TaskDependencyRepository taskDependencyRepository;
    private final ActivityLogService activityLogService;
    private final vn.nguyenlong.taskmanager.notifications.service.NotificationService notificationService;
    private final vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService webSocketBroadcastService;
    private final ScrumboardMapper scrumboardMapper;
    private final ActivityLogRepository activityLogRepository;
    private final vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository notificationRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final BoardMemberRepository boardMemberRepository;

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
        
        // ✅ FIX: Load dependencies
        cardRepository.findByIdWithDependencies(id).ifPresent(c -> {
            card.setDependencies(c.getDependencies());
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
            ListEntity targetList = listRepository.findById(request.getLaneId())
                    .orElseThrow(() -> new NotFoundException("List not found with id: " + request.getLaneId()));

            if (card.getList() != null && targetList.getId() != null && !targetList.getId().equals(card.getList().getId())) {
                validateMoveCard(card, targetList, request.getMemberIds());
            }

            card.setList(targetList);
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

    @Transactional(rollbackFor = Exception.class)
    public CardDto updateCardCategory(UpdateCardCategoryRequest request) {
        
        CardEntity card = cardRepository.findByIdWithListAndBoard(request.getCardId())
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + request.getCardId()));
        
        ListEntity newList = listRepository.findById(request.getLaneId())
                .orElseThrow(() -> new NotFoundException("List not found with id: " + request.getLaneId()));
        
        Long oldListId = card.getList().getId();
        String oldListName = card.getList().getName();
        
        validateMoveCard(card, newList, null);

        card.setList(newList);
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
            taskDependencyRepository.deleteByCardId(id);
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
        CardEntity card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));
        Long boardId = card.getList().getBoard().getId();
        String boardName = card.getList().getBoard().getName();
        Long currentUserId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();

        for (Long memberId : memberIds) {
            if (!cardMemberRepository.existsByCardIdAndUserId(cardId, memberId)) {
                User user = userRepository.findById(memberId)
                        .orElseThrow(() -> new NotFoundException("User not found with id: " + memberId));
                
                CardMemberEntity cardMember = new CardMemberEntity();
                cardMember.setCard(card);
                cardMember.setUser(user);
                cardMemberRepository.save(cardMember);

                // Lấy vai trò của người này trong dự án (nếu có)
                String roleName = "Member";
                var boardMember = boardMemberRepository.findByBoardIdAndUserId(boardId, memberId);
                if (boardMember.isPresent() && boardMember.get().getBoardRole() != null) {
                    roleName = boardMember.get().getBoardRole().getName();
                }

                // Gửi thông báo phân công nhiệm vụ
                if (currentUserId != null && !memberId.equals(currentUserId)) {
                    String title = "Phân công công việc: " + card.getTitle();
                    String message = "Bạn được phân công thẻ \"" + card.getTitle() + "\" trong dự án \"" + boardName + "\".";
                    
                    notificationService.createNotification(
                        "CARD_ASSIGNED",
                        title,
                        message,
                        memberId, boardId, cardId, currentUserId, null
                    );
                }
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

    private void updateCardMembers(Long cardId, List<Long> newMemberIds) {
        CardEntity card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));
        Long boardId = card.getList().getBoard().getId();
        String boardName = card.getList().getBoard().getName();
        Long currentUserId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();

        List<Long> existingMemberIds = cardMemberRepository.findByCardId(cardId).stream()
                .map(cm -> cm.getUser().getId())
                .toList();

        // Remove members not in new list
        for (Long oldId : existingMemberIds) {
            if (!newMemberIds.contains(oldId)) {
                cardMemberRepository.deleteByCardIdAndUserId(cardId, oldId);
            }
        }

        // Add members not in old list and notify them
        for (Long newId : newMemberIds) {
            if (!existingMemberIds.contains(newId)) {
                User user = userRepository.findById(newId)
                        .orElseThrow(() -> new NotFoundException("User not found with id: " + newId));
                CardMemberEntity cm = new CardMemberEntity();
                cm.setCard(card);
                cm.setUser(user);
                cardMemberRepository.save(cm);

                // Lấy vai trò của người này trong dự án (nếu có)
                String roleName = "Member";
                var boardMember = boardMemberRepository.findByBoardIdAndUserId(boardId, newId);
                if (boardMember.isPresent() && boardMember.get().getBoardRole() != null) {
                    roleName = boardMember.get().getBoardRole().getName();
                }

                // Gửi thông báo phân công nhiệm vụ
                if (currentUserId != null && !newId.equals(currentUserId)) {
                    String title = "Phân công công việc: " + card.getTitle();
                    String message = "Bạn được phân công thẻ \"" + card.getTitle() + "\" trong dự án \"" + boardName + "\".";
                    
                    notificationService.createNotification(
                        "CARD_ASSIGNED",
                        title,
                        message,
                        newId, boardId, cardId, currentUserId, null
                    );
                }
            }
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

    private void validateMoveCard(CardEntity card, ListEntity targetList, List<Long> targetMemberIds) {
        ListStatusType currentStatus = getEffectiveStatusType(card.getList());
        ListStatusType targetStatus = getEffectiveStatusType(targetList);

        log.info("Validating move for card {}: {} -> {}", card.getId(), currentStatus, targetStatus);

        validateWorkflow(currentStatus, targetStatus);

        if (targetStatus == ListStatusType.IN_PROGRESS) {
            log.info("Target status is IN_PROGRESS, checking dependencies for card {}", card.getId());
            validateDependenciesForStart(card.getId());
        }

        if (targetStatus == ListStatusType.DONE) {
            log.info("Target status is DONE, checking definition of done for card {}", card.getId());
            validateDefinitionOfDone(card.getId(), currentStatus, targetMemberIds);
        }
    }

    private ListStatusType getEffectiveStatusType(ListEntity list) {
        if (list == null || list.getStatusType() == null) {
            return ListStatusType.NONE;
        }
        return list.getStatusType();
    }

    private void validateWorkflow(ListStatusType currentStatus, ListStatusType targetStatus) {
        // Disallow skipping TODO -> DONE
        if (currentStatus == ListStatusType.TODO && targetStatus == ListStatusType.DONE) {
            throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                    vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_WORKFLOW_INVALID
            );
        }
        
        // Disallow backward moves from DONE
        if (currentStatus == ListStatusType.DONE && 
            (targetStatus == ListStatusType.IN_PROGRESS || targetStatus == ListStatusType.TODO)) {
            throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                    vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_WORKFLOW_BACKWARD_NOT_ALLOWED
            );
        }
        
        // Disallow backward move from IN_PROGRESS to TODO
        if (currentStatus == ListStatusType.IN_PROGRESS && targetStatus == ListStatusType.TODO) {
            throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                    vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_WORKFLOW_BACKWARD_NOT_ALLOWED
            );
        }
    }

    private void validateDependenciesForStart(Long successorCardId) {
        if (successorCardId == null) return;

        List<TaskDependencyEntity> dependencies = taskDependencyRepository
                .findBySuccessorIdWithPredecessorAndList(successorCardId);

        log.info("Validating dependencies for card {}: found {} dependencies", successorCardId, 
                dependencies != null ? dependencies.size() : 0);

        if (dependencies == null || dependencies.isEmpty()) return;

        for (TaskDependencyEntity dep : dependencies) {
            if (dep == null || dep.getPredecessor() == null) continue;

            ListStatusType predecessorStatus = getEffectiveStatusType(dep.getPredecessor().getList());
            log.info("Dependency check: card {} depends on card {} with status {}", 
                    successorCardId, dep.getPredecessor().getId(), predecessorStatus);
            
            if (predecessorStatus != ListStatusType.DONE) {
                log.warn("Blocking card {} move: dependency {} is not DONE (status: {})", 
                        successorCardId, dep.getPredecessor().getId(), predecessorStatus);
                throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                        vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_DEPENDENCY_INCOMPLETE
                );
            }
        }
        
        log.info("All dependencies for card {} are DONE, allowing move", successorCardId);
    }

    private void validateDefinitionOfDone(Long cardId, ListStatusType currentStatus, List<Long> targetMemberIds) {
        // 1) Card must be in IN_PROGRESS before moving to DONE
        if (currentStatus != ListStatusType.IN_PROGRESS) {
            throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                    vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_DOD_NOT_IN_PROGRESS
            );
        }

        // 2) If checklist exists, all must be completed
        List<ChecklistItemEntity> checklist = checklistItemRepository.findByCardId(cardId);
        if (checklist != null && !checklist.isEmpty()) {
            boolean hasUnfinished = checklist.stream().anyMatch(item -> item != null && !item.isChecked());
            if (hasUnfinished) {
                throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                        vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_CHECKLIST_INCOMPLETE
                );
            }
        }

        // 3) Card must have at least 1 member
        boolean hasMembers;
        if (targetMemberIds != null) {
            hasMembers = !targetMemberIds.isEmpty();
        } else {
            hasMembers = cardMemberRepository.countByCardId(cardId) > 0;
        }

        if (!hasMembers) {
            throw new vn.nguyenlong.taskmanager.core.exception.AppException(
                    vn.nguyenlong.taskmanager.core.exception.ErrorCode.SCRUMBOARD_DOD_MEMBER_REQUIRED
            );
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

    // ==================== DEPENDENCY MANAGEMENT ====================

    /**
     * Add dependencies (predecessors) to a card
     * @param cardId The successor card ID
     * @param predecessorIds List of predecessor card IDs
     */
    public void addDependencies(Long cardId, List<Long> predecessorIds) {
        CardEntity card = cardRepository.findByIdWithListAndBoard(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found with id: " + cardId));

        Long boardId = card.getList().getBoard().getId();

        for (Long predecessorId : predecessorIds) {
            // Validate: không cho self-dependency
            if (predecessorId.equals(cardId)) {
                throw new IllegalArgumentException("Card cannot depend on itself");
            }

            // Validate: predecessor phải tồn tại và cùng board
            CardEntity predecessor = cardRepository.findByIdWithListAndBoard(predecessorId)
                    .orElseThrow(() -> new NotFoundException("Predecessor card not found with id: " + predecessorId));

            if (!predecessor.getList().getBoard().getId().equals(boardId)) {
                throw new IllegalArgumentException("Predecessor card must be in the same board");
            }

            // Check duplicate
            TaskDependencyEntity existing = taskDependencyRepository
                    .findBySuccessorIdAndPredecessorId(cardId, predecessorId);
            if (existing != null) {
                continue; // Skip duplicate
            }

            // Create dependency
            TaskDependencyEntity dependency = new TaskDependencyEntity();
            dependency.setSuccessor(card);
            dependency.setPredecessor(predecessor);
            taskDependencyRepository.save(dependency);

            log.info("Added dependency: card {} depends on card {}", cardId, predecessorId);
        }
    }

    /**
     * Remove a specific dependency
     * @param cardId The successor card ID
     * @param predecessorId The predecessor card ID to remove
     */
    public void removeDependency(Long cardId, Long predecessorId) {
        TaskDependencyEntity dependency = taskDependencyRepository
                .findBySuccessorIdAndPredecessorId(cardId, predecessorId);

        if (dependency == null) {
            throw new NotFoundException("Dependency not found");
        }

        taskDependencyRepository.delete(dependency);
        log.info("Removed dependency: card {} no longer depends on card {}", cardId, predecessorId);
    }

    /**
     * Get all dependencies for a card
     * @param cardId The card ID
     * @return List of predecessor card IDs
     */
    @Transactional(readOnly = true)
    public List<Long> getDependencies(Long cardId) {
        List<TaskDependencyEntity> dependencies = taskDependencyRepository.findBySuccessorId(cardId);
        return dependencies.stream()
                .map(dep -> dep.getPredecessor().getId())
                .toList();
    }
}

