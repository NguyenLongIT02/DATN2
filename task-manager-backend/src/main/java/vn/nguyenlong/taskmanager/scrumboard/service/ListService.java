package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.core.exception.payload.ValidationException;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateListRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateListRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.CardListDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.ListEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.ListStatusType;
import vn.nguyenlong.taskmanager.scrumboard.mapper.ScrumboardMapper;
import vn.nguyenlong.taskmanager.scrumboard.repository.*;
import vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository;
import vn.nguyenlong.taskmanager.util.MessageKeys;
import jakarta.persistence.EntityManager;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ListService {

    private final ListRepository listRepository;
    private final BoardRepository boardRepository;
    private final ActivityLogService activityLogService;
    private final vn.nguyenlong.taskmanager.notifications.service.NotificationService notificationService;
    private final vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService webSocketBroadcastService;
    private final ScrumboardMapper scrumboardMapper;
    private final CardRepository cardRepository;
    private final CommentRepository commentRepository;
    private final AttachmentRepository attachmentRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final CardMemberRepository cardMemberRepository;
    private final CardLabelRepository cardLabelRepository;
    private final TaskDependencyRepository taskDependencyRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationRepository notificationRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<CardListDto> getListsByBoardId(Long boardId) {
        List<ListEntity> lists = listRepository.findByBoardIdWithCards(boardId);
        return scrumboardMapper.toCardListDtoList(lists);
    }

    @Transactional(readOnly = true)
    public CardListDto getListById(Long id) {
        ListEntity list = listRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("List not found with id: " + id));
        return scrumboardMapper.toCardListDto(list);
    }

    public CardListDto createList(CreateListRequest request) {
        
        BoardEntity board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + request.getBoardId()));

        if (listRepository.existsByNameAndBoardId(request.getName(), request.getBoardId())) {
            throw new ValidationException(MessageKeys.LIST_NAME_EXISTS);
        }

        ListEntity list = new ListEntity();
        list.setName(request.getName());
        list.setBoard(board);
        list.setStatusType(request.getStatusType() != null ? request.getStatusType() : ListStatusType.NONE);
        
        ListEntity savedList = listRepository.save(list);
        CardListDto dto = scrumboardMapper.toCardListDto(savedList);
        
        // Log & Notification & WS
        try {
            Long userId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();
            if (userId != null) {
                activityLogService.logActivity(board.getId(), null, userId, "CREATE_LIST", "đã tạo cột: " + dto.getName());
                
                notificationService.notifyBoardMembers(board.getId(), userId, "LIST_CREATED", 
                    "notification.list.created.title", "notification.list.created.message", 
                    null, null, dto.getName(), board.getName());
            }
            webSocketBroadcastService.broadcastListCreated(board.getId(), savedList.getId(), dto);
        } catch (Exception e) {
            log.error("Error in list creation post-processing: {}", e.getMessage());
        }

        return dto;
    }

    public CardListDto updateList(UpdateListRequest request) {
        
        log.info("Updating list {}: name={}, statusType={}", request.getId(), request.getName(), request.getStatusType());
        
        ListEntity list = listRepository.findById(request.getId())
                .orElseThrow(() -> new NotFoundException("List not found with id: " + request.getId()));

        if (!list.getName().equals(request.getName()) && 
            listRepository.existsByNameAndBoardId(request.getName(), list.getBoard().getId())) {
            throw new ValidationException(MessageKeys.LIST_NAME_EXISTS);
        }

        list.setName(request.getName());
        if (request.getStatusType() != null) {
            log.info("Setting statusType from {} to {}", list.getStatusType(), request.getStatusType());
            list.setStatusType(request.getStatusType());
        } else {
            log.warn("StatusType is null in request, keeping current value: {}", list.getStatusType());
        }
        ListEntity updatedList = listRepository.save(list);
        CardListDto dto = scrumboardMapper.toCardListDto(updatedList);
        
        log.info("List updated successfully: id={}, name={}, statusType={}", dto.getId(), dto.getName(), dto.getStatusType());
        
        // Log & WS
        try {
            Long userId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();
            if (userId != null) {
                activityLogService.logActivity(list.getBoard().getId(), null, userId, "UPDATE_LIST", "đã đổi tên cột thành: " + dto.getName());
            }
            webSocketBroadcastService.broadcastListUpdated(list.getBoard().getId(), updatedList.getId(), dto);
        } catch (Exception e) {
            log.error("Error in list update post-processing: {}", e.getMessage());
        }

        return dto;
    }

    @Transactional
    public void deleteList(Long id) {
        log.info("Starting manual cleanup for list: {}", id);
        
        ListEntity list = listRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("List not found with id: " + id));
        
        Long boardId = list.getBoard().getId();
        String listName = list.getName();

        try {
            // 1. Tìm tất cả các thẻ trong list này
            List<CardEntity> cards = cardRepository.findByListId(id);
            
            // 2. Dọn dẹp từng thẻ để tránh vi phạm khóa ngoại
            for (CardEntity card : cards) {
                Long cardId = card.getId();
                notificationRepository.deleteByCardId(cardId);
                activityLogRepository.nullifyCardId(cardId);
                commentRepository.deleteByCardId(cardId);
                attachmentRepository.deleteByCardId(cardId);
                checklistItemRepository.deleteByCardId(cardId);
                taskDependencyRepository.deleteByCardId(cardId);
                cardMemberRepository.deleteByCardId(cardId);
                cardLabelRepository.deleteByCardId(cardId);
            }
            
            // 3. Xóa liên kết hai chiều TRƯỚC KHI FLUSH để tránh lỗi TransientObjectException
            if (list.getBoard() != null) {
                list.getBoard().getLists().remove(list);
            }
            list.getCards().clear();
            
            // Flush các lệnh xóa card data
            entityManager.flush();

            // 4. Xóa các thẻ
            cardRepository.deleteByListId(id);
            entityManager.flush();

            // 5. Cuối cùng mới xóa List
            listRepository.delete(list);
            
            // Flush và Clear cache
            entityManager.flush();
            entityManager.clear();

            log.info("✓ Successfully deleted list and all its cards: {}", id);

            // WS & Log
            try {
                webSocketBroadcastService.broadcastListDeleted(boardId, id);
                Long userId = vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils.getCurrentUserId();
                if (userId != null) {
                    activityLogService.logActivity(boardId, null, userId, "DELETE_LIST", "đã xóa một cột: " + listName);
                }
            } catch (Exception e) {
                log.error("Error in list deletion post-processing: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("Error during manual list cleanup: {}", e.getMessage());
            throw new RuntimeException("Failed to delete list due to data constraints: " + e.getMessage(), e);
        }
    }
}
