package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.ChecklistDto;
import vn.nguyenlong.taskmanager.scrumboard.service.ChecklistItemService;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/scrumboard/checklist")
@RequiredArgsConstructor
@Tag(name = "Checklist Controller", description = "API endpoints for card checklist management")
public class ChecklistController {

    private final ChecklistItemService checklistItemService;

    @GetMapping("/{cardId}")
    @Operation(summary = "Get card checklist")
    public SuccessResponse<List<ChecklistDto>> getChecklist(@PathVariable Long cardId) {
        return ResponseUtil.ok(HttpStatus.OK.value(), "Success", 
                checklistItemService.getChecklistByCardId(cardId));
    }

    @PostMapping("/{cardId}")
    @Operation(summary = "Add checklist item")
    public SuccessResponse<ChecklistDto> addItem(@PathVariable Long cardId, @RequestParam String title) {
        return ResponseUtil.ok(HttpStatus.CREATED.value(), "Item added", 
                checklistItemService.addChecklistItem(cardId, title));
    }

    @PutMapping("/{itemId}/toggle")
    @Operation(summary = "Toggle checklist item status")
    public SuccessResponse<ChecklistDto> toggleItem(@PathVariable Long itemId) {
        return ResponseUtil.ok(HttpStatus.OK.value(), "Status toggled", 
                checklistItemService.toggleChecklistItem(itemId));
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Delete checklist item")
    public SuccessResponse<Void> deleteItem(@PathVariable Long itemId) {
        checklistItemService.deleteChecklistItem(itemId);
        return ResponseUtil.ok(HttpStatus.OK.value(), "Item deleted", null);
    }
}
