package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.ChecklistDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.ChecklistItemEntity;
import vn.nguyenlong.taskmanager.scrumboard.mapper.ScrumboardMapper;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.ChecklistItemRepository;
import vn.nguyenlong.taskmanager.scrumboard.service.ActivityLogService;
import vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService;
import vn.nguyenlong.taskmanager.core.auth.util.SecurityContextUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;
    private final CardRepository cardRepository;
    private final ScrumboardMapper scrumboardMapper;
    private final ActivityLogService activityLogService;
    private final WebSocketBroadcastService webSocketBroadcastService;

    @Transactional(readOnly = true)
    public List<ChecklistDto> getChecklistByCardId(Long cardId) {
        return scrumboardMapper.toChecklistDtoList(checklistItemRepository.findByCardId(cardId));
    }

    public ChecklistDto addChecklistItem(Long cardId, String title) {
        CardEntity card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        ChecklistItemEntity item = ChecklistItemEntity.builder()
                .title(title)
                .checked(false)
                .card(card)
                .build();

        ChecklistItemEntity savedItem = checklistItemRepository.save(item);
        
        Long boardId = card.getList().getBoard().getId();
        Long userId = SecurityContextUtils.getCurrentUserId();
        
        activityLogService.logActivity(boardId, cardId, userId, "CHECKLIST_ADDED", "đã thêm mục kiểm tra: " + title);
        webSocketBroadcastService.broadcastCardChecklistUpdated(boardId, cardId, getChecklistByCardId(cardId));
        
        return scrumboardMapper.toChecklistDto(savedItem);
    }

    public ChecklistDto toggleChecklistItem(Long itemId) {
        ChecklistItemEntity item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Checklist item not found"));
        
        item.setChecked(!item.isChecked());
        ChecklistItemEntity updatedItem = checklistItemRepository.save(item);
        
        Long cardId = updatedItem.getCard().getId();
        Long boardId = updatedItem.getCard().getList().getBoard().getId();
        Long userId = SecurityContextUtils.getCurrentUserId();
        
        String action = updatedItem.isChecked() ? "đã hoàn thành" : "đã bỏ chọn";
        activityLogService.logActivity(boardId, cardId, userId, "CHECKLIST_TOGGLE", 
                action + " mục kiểm tra: " + updatedItem.getTitle());
        webSocketBroadcastService.broadcastCardChecklistUpdated(boardId, cardId, getChecklistByCardId(cardId));
        
        return scrumboardMapper.toChecklistDto(updatedItem);
    }

    public void deleteChecklistItem(Long itemId) {
        ChecklistItemEntity item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Checklist item not found"));
        Long cardId = item.getCard().getId();
        Long boardId = item.getCard().getList().getBoard().getId();
        
        checklistItemRepository.delete(item);
        webSocketBroadcastService.broadcastCardChecklistUpdated(boardId, cardId, getChecklistByCardId(cardId));
    }
}
