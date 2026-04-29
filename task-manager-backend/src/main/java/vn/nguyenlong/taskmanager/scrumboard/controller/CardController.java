package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.notifications.service.NotificationService;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateCardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateCardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateCardCategoryRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.CardDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.CardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.ListEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.ListRepository;
import vn.nguyenlong.taskmanager.scrumboard.security.AuthzService;
import vn.nguyenlong.taskmanager.scrumboard.service.CardService;
import vn.nguyenlong.taskmanager.scrumboard.service.ActivityLogService;
import vn.nguyenlong.taskmanager.core.component.TranslateMessage;
import vn.nguyenlong.taskmanager.util.MessageKeys;
import vn.nguyenlong.taskmanager.websocket.service.WebSocketBroadcastService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/scrumboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Card Controller", description = "API endpoints for card management")
public class CardController {

    private final CardService cardService;
    private final TranslateMessage translateMessage;
    private final AuthzService authzService;
    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final ListRepository listRepository;
    private final WebSocketBroadcastService webSocketBroadcastService;
    private final NotificationService notificationService;
    private final ActivityLogService activityLogService;

    @GetMapping("/card/{listId}")
    @Operation(summary = "Get cards by list ID", description = "Retrieve all cards for a specific list")
    public SuccessResponse<List<CardDto>> getCardsByListId(
            @Parameter(description = "List ID") @PathVariable Long listId) {
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.CARD_GET_SUCCESS),
                cardService.getCardsByListId(listId));
    }

    @GetMapping("/card/detail/{id}")
    @Operation(summary = "Get card by ID", description = "Retrieve a specific card with all details")
    public SuccessResponse<CardDto> getCardById(
            @Parameter(description = "Card ID") @PathVariable Long id) {
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.CARD_GET_SUCCESS),
                cardService.getCardById(id));
    }

    @PostMapping("/add/card")
    @Operation(summary = "Create new card", description = "Create a new card in a list")
    public SuccessResponse<CardDto> createCard(
            @Valid @RequestBody CreateCardRequest request,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        
        ListEntity sourceList = listRepository.findByIdWithBoard(request.getLaneId())
            .orElseThrow(() -> new NotFoundException("List not found"));
        Long boardId = sourceList.getBoard().getId();
        String boardName = sourceList.getBoard().getName();
        
        // ✅ MEMBER có thể tạo card
        if (!authzService.canCreateCard(userId, boardId)) {
            throw new AccessDeniedException("Only board members can create cards");
        }
        
        CardDto createdCard = cardService.createCard(request);
        
        return ResponseUtil.ok(HttpStatus.CREATED.value(),
                translateMessage.translate(MessageKeys.CARD_CREATE_SUCCESS),
                createdCard);
    }

    @PutMapping("/edit/card")
    @Operation(summary = "Update card", description = "Update an existing card")
    public SuccessResponse<CardDto> updateCard(
            @Valid @RequestBody UpdateCardRequest request,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        
        // Lấy boardId từ card
        Long boardId = cardRepository.findByIdWithListAndBoard(request.getId())
                .map(card -> card.getList().getBoard().getId())
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        // ✅ MEMBER có thể update card (theo yêu cầu)
        if (!authzService.canUpdateCard(userId, boardId)) {
            throw new AccessDeniedException("Only board members can update cards");
        }
        
        CardDto updatedCard = cardService.updateCard(request);
        
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.CARD_UPDATE_SUCCESS),
                updatedCard);
    }

    @PutMapping("/cards/update/category")
    @Operation(summary = "Update card category", description = "Move a card to a different list")
    public SuccessResponse<CardDto> updateCardCategory(
            @Valid @RequestBody UpdateCardCategoryRequest request,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        
        CardEntity currentCard = cardRepository.findByIdWithListAndBoard(request.getCardId())
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        Long boardId = currentCard.getList().getBoard().getId();
        String boardName = currentCard.getList().getBoard().getName();
        
        // ✅ MEMBER có thể category card (theo yêu cầu)
        if (!authzService.canCategoryCard(userId, boardId)) {
            throw new AccessDeniedException("Only board members can move cards");
        }
        
        Long fromListId = currentCard.getList().getId();

        String fromListName = listRepository.findById(fromListId)
            .map(list -> list.getName())
            .orElse("Unknown");
        String toListName = listRepository.findById(request.getLaneId())
            .map(list -> list.getName())
            .orElse("Unknown");
        
        CardDto updatedCard = cardService.updateCardCategory(request);
        
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.CARD_MOVE_SUCCESS),
                updatedCard);
    }

    @DeleteMapping("/delete/card")
    @Operation(summary = "Delete card", description = "Delete a card by ID")
    public SuccessResponse<String> deleteCard(
            @Parameter(description = "Card ID") @RequestParam Long id,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);
        
        // Lấy boardId từ card
        Long boardId = cardRepository.findByIdWithListAndBoard(id)
                .map(card -> card.getList().getBoard().getId())
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
        
        // ✅ Chỉ OWNER mới được xóa card
        if (!authzService.canDeleteCard(userId, boardId)) {
            throw new AccessDeniedException("Only board owner can delete cards");
        }
        
        // Broadcast WebSocket message trước khi xóa
        webSocketBroadcastService.broadcastCardDeleted(boardId, id);
        
        cardService.deleteCard(id);

        activityLogService.logActivity(boardId, null, userId, "DELETE_CARD", "đã xóa thẻ ID: " + id);

        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.CARD_DELETE_SUCCESS), null);
    }

    // ==================== DEPENDENCY MANAGEMENT ====================

    @PostMapping("/cards/{cardId}/dependencies")
    @Operation(summary = "Add dependencies to a card", description = "Add predecessor cards that this card depends on")
    public SuccessResponse<Void> addDependencies(
            @PathVariable Long cardId,
            @Valid @RequestBody vn.nguyenlong.taskmanager.scrumboard.dto.request.AddDependenciesRequest request,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);

        // Get card to check board access
        CardEntity card = cardRepository.findByIdWithListAndBoard(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        Long boardId = card.getList().getBoard().getId();

        // Check permission: MEMBER can manage dependencies
        if (!authzService.canEditCard(userId, boardId)) {
            throw new AccessDeniedException("You don't have permission to manage dependencies");
        }

        cardService.addDependencies(cardId, request.getPredecessorIds());

        return ResponseUtil.ok(HttpStatus.OK.value(),
                "Dependencies added successfully", null);
    }

    @DeleteMapping("/cards/{cardId}/dependencies/{predecessorId}")
    @Operation(summary = "Remove a dependency", description = "Remove a predecessor card dependency")
    public SuccessResponse<Void> removeDependency(
            @PathVariable Long cardId,
            @PathVariable Long predecessorId,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);

        // Get card to check board access
        CardEntity card = cardRepository.findByIdWithListAndBoard(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        Long boardId = card.getList().getBoard().getId();

        // Check permission
        if (!authzService.canEditCard(userId, boardId)) {
            throw new AccessDeniedException("You don't have permission to manage dependencies");
        }

        cardService.removeDependency(cardId, predecessorId);

        return ResponseUtil.ok(HttpStatus.OK.value(),
                "Dependency removed successfully", null);
    }

    @GetMapping("/cards/{cardId}/dependencies")
    @Operation(summary = "Get card dependencies", description = "Get all predecessor cards that this card depends on")
    public SuccessResponse<List<Long>> getDependencies(
            @PathVariable Long cardId,
            Principal principal) {
        Long userId = extractUserIdFromPrincipal(principal);

        // Get card to check board access
        CardEntity card = cardRepository.findByIdWithListAndBoard(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));
        Long boardId = card.getList().getBoard().getId();

        // Check permission: any board member can view
        if (!authzService.isBoardMember(userId, boardId)) {
            throw new AccessDeniedException("You don't have permission to view this card");
        }

        List<Long> dependencies = cardService.getDependencies(cardId);

        return ResponseUtil.ok(HttpStatus.OK.value(),
                "Dependencies retrieved successfully",
                dependencies);
    }
    
    private Long extractUserIdFromPrincipal(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new AccessDeniedException("User not authenticated");
        }

        String username = principal.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + username))
                .getId();
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
