package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.AiBoardChatRequestDto;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateBoardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateBoardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.AiBoardChatResponseDto;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.AiBoardSuggestionDto;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.BoardDto;
import vn.nguyenlong.taskmanager.scrumboard.service.BoardAiSuggestionService;
import vn.nguyenlong.taskmanager.scrumboard.service.BoardService;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.core.component.TranslateMessage;
import vn.nguyenlong.taskmanager.util.MessageKeys;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("${api.prefix}/scrumboard/board")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Board Controller", description = "API endpoints for board management")
public class BoardController {

    private final BoardService boardService;
    private final BoardAiSuggestionService boardAiSuggestionService;
    private final BoardRepository boardRepository;
    private final TranslateMessage translateMessage;
    private final UserRepository userRepository;

    @GetMapping("/list")
    @Operation(summary = "Get user's boards", description = "Retrieve all boards that the user is a member of")
    public SuccessResponse<List<BoardDto>> getAllBoards(Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.BOARD_GET_SUCCESS),
                boardService.getAllBoards(currentUserId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get board by ID", description = "Retrieve a specific board with all details")
    public SuccessResponse<BoardDto> getBoardById(
            @Parameter(description = "Board ID") @PathVariable Long id,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.BOARD_GET_SUCCESS),
                boardService.getBoardById(id, currentUserId));
    }

    @PostMapping("/add/board")
    @Operation(summary = "Create new board", description = "Create a new board with auto-assigned OWNER role")
    public SuccessResponse<BoardDto> createBoard(
            @Valid @RequestBody CreateBoardRequest request,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        return ResponseUtil.ok(HttpStatus.CREATED.value(),
                translateMessage.translate(MessageKeys.BOARD_CREATE_SUCCESS),
                boardService.createBoard(request, currentUserId));
    }

    @PutMapping("/edit/board")
    @Operation(summary = "Update board", description = "Update an existing board")
    public SuccessResponse<BoardDto> updateBoard(
            @Valid @RequestBody UpdateBoardRequest request,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.BOARD_UPDATE_SUCCESS),
                boardService.updateBoard(request, currentUserId));
    }

    @DeleteMapping("/delete/board")
    @Operation(summary = "Delete board", description = "Delete a board by ID")
    public SuccessResponse<String> deleteBoard(
            @Parameter(description = "Board ID") @RequestParam Long id,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        boardService.deleteBoard(id, currentUserId);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.BOARD_DELETE_SUCCESS));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get board members", description = "Retrieve all members of a specific board")
    public SuccessResponse<List<Object>> getBoardMembers(
            @Parameter(description = "Board ID") @PathVariable Long id) {
        // This would need to be implemented with MemberService
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.MEMBER_GET_SUCCESS),
                List.of());
    }

    @GetMapping("/{id}/ai-suggestions")
    @Operation(summary = "Get AI suggestions for board", description = "Generate AI priorities, risks, and assignment suggestions for a board")
    public SuccessResponse<AiBoardSuggestionDto> getBoardAiSuggestions(
            @Parameter(description = "Board ID") @PathVariable Long id,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        return ResponseUtil.ok(HttpStatus.OK.value(),
                translateMessage.translate(MessageKeys.BOARD_AI_SUGGESTION_SUCCESS),
                boardAiSuggestionService.generateBoardSuggestions(id, currentUserId));
    }

        @PostMapping("/{id}/ai-chat")
        @Operation(summary = "Chat with board AI", description = "Ask follow-up questions about board data and receive grounded AI responses")
        public SuccessResponse<AiBoardChatResponseDto> chatWithBoardAi(
            @Parameter(description = "Board ID") @PathVariable Long id,
            @Valid @RequestBody AiBoardChatRequestDto request,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        return ResponseUtil.ok(HttpStatus.OK.value(),
            translateMessage.translate(MessageKeys.BOARD_AI_CHAT_SUCCESS),
            boardAiSuggestionService.answerBoardQuestion(id, currentUserId, request));
        }

    private Long extractUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        try {
            String username = principal.getName();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username))
                    .getId();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid user authentication: " + e.getMessage());
        }
    }
}
