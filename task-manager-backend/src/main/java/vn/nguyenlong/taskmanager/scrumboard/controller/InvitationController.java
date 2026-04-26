package vn.nguyenlong.taskmanager.scrumboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.nguyenlong.taskmanager.core.component.TranslateMessage;
import vn.nguyenlong.taskmanager.core.util.ResponseUtil;
import vn.nguyenlong.taskmanager.core.entity.SuccessResponse;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.scrumboard.dto.InviteRequestDto;
import vn.nguyenlong.taskmanager.scrumboard.invitation.InvitationTokenService;
import vn.nguyenlong.taskmanager.scrumboard.service.InvitationService;
import vn.nguyenlong.taskmanager.util.MessageKeys;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("${api.prefix}/scrumboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Invitation Controller", description = "API endpoints for board invitations")
public class InvitationController {

    private final InvitationService invitationService;
    private final TranslateMessage translateMessage;
    private final UserRepository userRepository;
    private final InvitationTokenService invitationTokenService;

    @PostMapping("/boards/{boardId}/invite")
    @Operation(summary = "Invite user to board", description = "Invite a user to board via email. User will be assigned MEMBER role automatically.")
    public SuccessResponse<Map<String, Object>> invite(
            @Parameter(description = "Board ID") @PathVariable Long boardId,
            @Valid @RequestBody InviteRequestDto request,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        Map<String, Object> res = invitationService.invite(boardId, request, currentUserId);
        int status = (int) res.getOrDefault("status", HttpStatus.CREATED.value());
        return ResponseUtil.ok(status, translateMessage.translate(MessageKeys.MEMBER_ADD_SUCCESS), res);
    }

    @GetMapping("/invitations/accept")
    public SuccessResponse<Map<String, Object>> accept(@RequestParam("token") String token,
                                                       Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal); // may be null if unauthenticated
        Map<String, Object> res = invitationService.accept(token, currentUserId);
        int status = (int) res.getOrDefault("status", HttpStatus.OK.value());
        return ResponseUtil.ok(status, translateMessage.translate(MessageKeys.MEMBER_ADD_SUCCESS), res);
    }

    @PostMapping("/invitations/complete")
    public SuccessResponse<Map<String, Object>> complete(@RequestBody Map<String, Object> body) {
        String token = String.valueOf(body.get("token"));
        Long userId = Long.parseLong(String.valueOf(body.get("userId")));
        Map<String, Object> res = invitationService.complete(token, userId);
        int status = (int) res.getOrDefault("status", HttpStatus.OK.value());
        return ResponseUtil.ok(status, translateMessage.translate(MessageKeys.MEMBER_ADD_SUCCESS), res);
    }

    @PostMapping("/invitations/complete-after-login")
    @Operation(summary = "Complete invitation after login", description = "Complete invitation after user has logged in. User ID is extracted from authentication context.")
    public SuccessResponse<Map<String, Object>> completeAfterLogin(
            @RequestParam("token") String token,
            Principal principal) {
        Long currentUserId = extractUserIdFromPrincipal(principal);
        Map<String, Object> res = invitationService.complete(token, currentUserId);
        int status = (int) res.getOrDefault("status", HttpStatus.OK.value());
        return ResponseUtil.ok(status, translateMessage.translate(MessageKeys.MEMBER_ADD_SUCCESS), res);
    }

    @GetMapping("/invitations/debug/{token}")
    @Operation(summary = "Debug invitation token", description = "Check if invitation token exists and get its data")
    public SuccessResponse<Map<String, Object>> debugToken(@PathVariable String token) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<Map<String, Object>> payloadOpt = invitationTokenService.getInvitationToken(token);
            if (payloadOpt.isPresent()) {
                result.put("exists", true);
                result.put("data", payloadOpt.get());
            } else {
                result.put("exists", false);
                result.put("message", "Token not found or expired");
            }
        } catch (Exception e) {
            result.put("exists", false);
            result.put("error", e.getMessage());
        }
        
        return ResponseUtil.ok(HttpStatus.OK.value(), "Debug result", result);
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


