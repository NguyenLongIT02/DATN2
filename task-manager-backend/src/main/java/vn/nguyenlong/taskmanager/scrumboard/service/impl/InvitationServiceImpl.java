package vn.nguyenlong.taskmanager.scrumboard.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.common.email.EmailService;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.notifications.service.NotificationService;
import vn.nguyenlong.taskmanager.scrumboard.dto.InviteRequestDto;
import vn.nguyenlong.taskmanager.scrumboard.dto.InvitationPayloadDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.invitation.InvitationTokenService;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardMemberRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRoleRepository;
import vn.nguyenlong.taskmanager.scrumboard.security.AuthzService;
import vn.nguyenlong.taskmanager.scrumboard.service.InvitationService;
import vn.nguyenlong.taskmanager.scrumboard.service.MemberService;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardRoleEntity;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationServiceImpl implements InvitationService {

    private final AuthzService authzService;
    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final BoardRoleRepository boardRoleRepository;
    private final UserRepository userRepository;
    private final MemberService memberService;
    private final InvitationTokenService invitationTokenService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${FRONTEND_BASE_URL:http://localhost:5173}")
    private String frontendBaseUrl;
    
    @Value("${BACKEND_BASE_URL:http://localhost:8081}")
    private String backendBaseUrl;

    private static final long INVITE_TTL_HOURS = 48L;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> invite(Long boardId, InviteRequestDto request, Long currentUserId) {
        log.info("Inviting user {} to board {} by user {}", request.getEmail(), boardId, currentUserId);
        
        // Validate: chỉ OWNER mới được invite (bao gồm global ADMIN)
        if (!authzService.canInviteMembers(currentUserId, boardId)) {
            log.warn("User {} cannot invite members to board {} - Access denied", currentUserId, boardId);
            return apiError(HttpStatus.FORBIDDEN.value(), "Forbidden: Only board owner can invite members");
        }

        BoardEntity board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + boardId));

        // Validate: người được mời chưa phải member của board
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (boardMemberRepository.existsByBoardIdAndUserId(boardId, existingUser.getId())) {
                log.warn("User {} is already a member of board {}", existingUser.getId(), boardId);
                return apiError(HttpStatus.CONFLICT.value(), "Already member");
            }
            
            // ✅ THAY ĐỔI: Tạo invitation cho cả user đã tồn tại
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", request.getEmail());
            payload.put("boardId", boardId);
            payload.put("boardName", board.getName());
            payload.put("invitedById", currentUserId);
            
            // Luôn assign MEMBER role cho invitation
            BoardRoleEntity memberRole = boardRoleRepository.findByBoardIdAndIsDefaultTrue(boardId)
                    .orElseThrow(() -> new NotFoundException("Default MEMBER role not found for board " + boardId));
            Long roleId = memberRole.getId();
            log.info("Assigned MEMBER role {} for invitation", roleId);
            payload.put("roleId", roleId);

            String token = invitationTokenService.generateInvitationToken(payload, Duration.ofHours(INVITE_TTL_HOURS));
            String acceptLink = "http://localhost:8081/web/invitations/accept?token=" + token;
            emailService.sendBoardInvite(request.getEmail(), board.getName(), getInviterName(currentUserId), acceptLink, INVITE_TTL_HOURS);
            
            log.info("Invitation sent to {} for board {} with token expiry {} hours", 
                    request.getEmail(), boardId, INVITE_TTL_HOURS);
            
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Invitation sent");
            res.put("token", token);
            res.put("expiresInHours", INVITE_TTL_HOURS);
            return res;
        }

        // User not existed -> create invitation token
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", request.getEmail());
        payload.put("boardId", boardId);
        payload.put("boardName", board.getName());
        payload.put("invitedById", currentUserId);
        
        // Luôn assign MEMBER role cho invitation
        BoardRoleEntity memberRole = boardRoleRepository.findByBoardIdAndIsDefaultTrue(boardId)
                .orElseThrow(() -> new NotFoundException("Default MEMBER role not found for board " + boardId));
        Long roleId = memberRole.getId();
        log.info("Assigned MEMBER role {} for invitation", roleId);
        payload.put("roleId", roleId);

        String token = invitationTokenService.generateInvitationToken(payload, Duration.ofHours(INVITE_TTL_HOURS));
        String acceptLink = backendBaseUrl + "/web/invitations/accept?token=" + token;
        emailService.sendBoardInvite(request.getEmail(), board.getName(), getInviterName(currentUserId), acceptLink, INVITE_TTL_HOURS);
        
        log.info("Invitation sent to {} for board {} with token expiry {} hours", 
                request.getEmail(), boardId, INVITE_TTL_HOURS);
        
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Invitation sent");
        res.put("token", token);
        res.put("expiresInHours", INVITE_TTL_HOURS);
        return res;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> accept(String token, Long currentUserId) {
        log.info("Processing invitation acceptance for token: {} by user: {}", token, currentUserId);
        
        // ✅ FIX: Check invitation còn valid - KHÔNG consume token ngay
        Optional<Map<String, Object>> payloadOpt = invitationTokenService.getInvitationToken(token);
        if (payloadOpt.isEmpty()) {
            log.warn("Invitation token {} is expired or invalid", token);
            return apiError(410, "Invitation expired or invalid");
        }
        
        Map<String, Object> payload = payloadOpt.get();
        String email = (String) payload.get("email");
        Long boardId = toLong(payload.get("boardId"));
        String boardName = (String) payload.get("boardName");
        Long invitedById = toLong(payload.get("invitedById"));
        Long roleId = toLong(payload.get("roleId"));

        if (currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new NotFoundException("User not found with id: " + currentUserId));
            
            // Validate email match
            if (!StringUtils.equalsIgnoreCase(currentUser.getEmail(), email)) {
                log.warn("Email mismatch for user {}: expected {}, got {}", 
                        currentUserId, email, currentUser.getEmail());
                return apiError(HttpStatus.FORBIDDEN.value(), "Email mismatch. Please login with invited email.");
            }
            
            // ✅ FIX: Check if already member BEFORE consuming token (idempotency)
            if (boardMemberRepository.existsByBoardIdAndUserId(boardId, currentUserId)) {
                log.info("User {} is already a member of board {} - consuming token anyway for idempotency", 
                        currentUserId, boardId);
                // Consume token to prevent reuse
                invitationTokenService.consumeInvitationToken(token);
                
                Map<String, Object> res = new HashMap<>();
                res.put("message", "Already a member of this board");
                res.put("boardId", boardId);
                res.put("boardName", boardName);
                res.put("alreadyMember", true);
                return res;
            }
            
            // ✅ FIX: Consume token ONLY when ready to add member
            Optional<Map<String, Object>> consumeResult = invitationTokenService.consumeInvitationToken(token);
            if (consumeResult.isEmpty()) {
                log.warn("Failed to consume invitation token {} - may have been used", token);
                return apiError(410, "Invitation token has been used or expired");
            }
            
            try {
                // ✅ FIX: Add member with proper error handling
                memberService.addMemberToBoard(boardId, currentUserId, invitedById, roleId);
                log.info("User {} successfully joined board {} with role {}", currentUserId, boardId, roleId);
                
                // ✅ FIX: Create notification for board owner
                try {
                    notificationService.createNotification(
                        "member_joined",
                        vn.nguyenlong.taskmanager.util.MessageKeys.NOTIFICATION_MEMBER_JOINED_TITLE,
                        vn.nguyenlong.taskmanager.util.MessageKeys.NOTIFICATION_MEMBER_JOINED_MESSAGE,
                        invitedById,  // Notify the inviter
                        boardId,
                        null,
                        currentUserId,  // Actor is the new member
                        "{}",
                        currentUser.getFullName(),  // {0} - member name
                        boardName  // {1} - board name
                    );
                } catch (Exception e) {
                    log.error("Failed to create notification for member join: {}", e.getMessage());
                    // Don't fail the whole operation if notification fails
                }
                
                Map<String, Object> res = new HashMap<>();
                res.put("message", "Joined board successfully");
                res.put("boardId", boardId);
                res.put("boardName", boardName);
                res.put("roleId", roleId);
                res.put("alreadyMember", false);
                return res;
                
            } catch (IllegalArgumentException e) {
                // ✅ FIX: Handle duplicate member error gracefully
                if (e.getMessage().contains("already a member")) {
                    log.warn("Race condition detected: User {} already added to board {}", currentUserId, boardId);
                    Map<String, Object> res = new HashMap<>();
                    res.put("message", "Already a member of this board");
                    res.put("boardId", boardId);
                    res.put("boardName", boardName);
                    res.put("alreadyMember", true);
                    return res;
                }
                throw e;  // Re-throw other errors
            }
        }

        // Return invitation details for unauthenticated user - KHÔNG consume token
        Map<String, Object> res = new HashMap<>();
        res.put("email", email);
        res.put("boardId", boardId);
        res.put("boardName", boardName);
        res.put("inviteToken", token);
        res.put("roleId", roleId);
        res.put("requiresAuth", true);
        return res;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> complete(String token, Long userId) {
        Optional<Map<String, Object>> payloadOpt = invitationTokenService.consumeInvitationToken(token);
        if (payloadOpt.isEmpty()) {
            return apiError(410, "Invitation expired or invalid");
        }
        Map<String, Object> payload = payloadOpt.get();
        String email = (String) payload.get("email");
        Long boardId = toLong(payload.get("boardId"));
        Long invitedById = toLong(payload.get("invitedById"));
        Long roleId = toLong(payload.get("roleId"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        if (!StringUtils.equalsIgnoreCase(user.getEmail(), email)) {
            return apiError(HttpStatus.FORBIDDEN.value(), "Email mismatch. Please login with invited email.");
        }
        memberService.addMemberToBoard(boardId, userId, invitedById, roleId);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Joined board");
        res.put("boardId", boardId);
        return res;
    }

    private Map<String, Object> apiError(int status, String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("status", status);
        err.put("message", message);
        return err;
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(String.valueOf(v));
    }

    private String getInviterName(Long userId) {
        try {
            return userRepository.findById(userId).map(User::getFullName).orElse("Someone");
        } catch (Exception e) {
            return "Someone";
        }
    }
}


