package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.MemberDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardMemberEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardRoleEntity;
import vn.nguyenlong.taskmanager.scrumboard.mapper.ScrumboardMapper;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardMemberRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRoleRepository;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.notifications.service.NotificationService;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MemberService {

    private final BoardMemberRepository boardMemberRepository;
    private final BoardRepository boardRepository;
    private final BoardRoleRepository boardRoleRepository;
    private final UserRepository userRepository;
    private final ScrumboardMapper scrumboardMapper;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<MemberDto> getBoardMembers(Long boardId) {
        List<BoardMemberEntity> members = boardMemberRepository.findActiveByBoardId(boardId);
        return scrumboardMapper.toMemberDtoList(members);
    }

    @Transactional(readOnly = true)
    public MemberDto getBoardMember(Long boardId, Long userId) {
        BoardMemberEntity member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found for board " + boardId + " and user " + userId));
        return scrumboardMapper.toMemberDto(member);
    }

    public void addMemberToBoard(Long boardId, Long userId) {
        BoardRoleEntity defaultMemberRole = boardRoleRepository.findByBoardIdAndIsDefaultTrue(boardId)
                .or(() -> boardRoleRepository.findByBoardIdAndName(boardId, "Member"))
                .orElseThrow(() -> new NotFoundException("Default Member role not found for board " + boardId));

        addMemberToBoard(boardId, userId, null, defaultMemberRole.getId());
    }

    public void addMemberToBoard(Long boardId, Long userId, Long invitedById, Long roleId) {
        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            log.warn("User {} is already a member of board {}", userId, boardId);
            throw new IllegalArgumentException("User is already a member of this board");
        }

        BoardEntity board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + boardId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + userId));
        
        User invitedBy = null;
        if (invitedById != null) {
            invitedBy = userRepository.findById(invitedById)
                    .orElseThrow(() -> new NotFoundException("Inviter not found with id: " + invitedById));
        }

        BoardMemberEntity member = BoardMemberEntity.builder()
                .board(board)
                .user(user)
                .invitedBy(invitedBy)
                .status("active")
                .build();

        if (roleId != null) {
            BoardRoleEntity role = boardRoleRepository.findById(roleId)
                    .orElseThrow(() -> new NotFoundException("Board role not found with id: " + roleId));
            // Ngăn thêm PM thứ 2 vào board
            if ("Project Manager".equalsIgnoreCase(role.getName())) {
                boolean alreadyHasPM = boardMemberRepository.findActiveByBoardId(boardId).stream()
                        .anyMatch(m -> m.getBoardRole() != null
                                && "Project Manager".equalsIgnoreCase(m.getBoardRole().getName()));
                if (alreadyHasPM) {
                    throw new IllegalArgumentException("Board đã có Project Manager. Mỗi board chỉ có 1 Project Manager.");
                }
            }
            member.setBoardRole(role);
        }

        member.setJoinedAt(java.time.Instant.now());
        
        try {
            boardMemberRepository.save(member);
            log.info("Successfully added user {} to board {} with role {}", userId, boardId, roleId);
            
            // Gửi thông báo mời vào dự án theo đúng format yêu cầu
            if (invitedById != null && !invitedById.equals(userId)) {
                String roleName = member.getBoardRole() != null ? member.getBoardRole().getName() : "Member";
                String title = "Tham gia dự án: " + board.getName();
                String message = "Bạn tham gia dự án \"" + board.getName() + "\" với vai trò " + roleName + ".";
                
                notificationService.createNotification(
                    "BOARD_INVITATION",
                    title,
                    message,
                    userId, boardId, null, invitedById, null
                );
            }
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Database constraint violation when adding user {} to board {}: {}", 
                    userId, boardId, e.getMessage());
            throw new IllegalArgumentException("User is already a member of this board");
        }
    }

    public void removeMemberFromBoard(Long boardId, Long userId) {
        
        BoardMemberEntity member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found for board " + boardId + " and user " + userId));
        
        // Không cho xóa Project Manager
        if (member.getBoardRole() != null && "Project Manager".equalsIgnoreCase(member.getBoardRole().getName())) {
            throw new IllegalArgumentException("Không thể xóa Project Manager khỏi board.");
        }
        
        boardMemberRepository.delete(member);
    }

    public void updateMemberRole(Long boardId, Long userId, String roleName) {
        BoardMemberEntity member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found for board " + boardId + " and user " + userId));

        BoardRoleEntity newRole = boardRoleRepository.findByBoardIdAndName(boardId, roleName)
                .orElseThrow(() -> new NotFoundException("Role '" + roleName + "' not found for board " + boardId));

        // Không cho đổi vai trò của PM hiện tại
        if (member.getBoardRole() != null && "Project Manager".equalsIgnoreCase(member.getBoardRole().getName())) {
            throw new IllegalArgumentException("Không thể thay đổi vai trò của Project Manager.");
        }

        // Ngăn gán PM nếu board đã có PM khác
        if ("Project Manager".equalsIgnoreCase(roleName)) {
            boolean alreadyHasPM = boardMemberRepository.findActiveByBoardId(boardId).stream()
                    .anyMatch(m -> !m.getUser().getId().equals(userId)
                            && m.getBoardRole() != null
                            && "Project Manager".equalsIgnoreCase(m.getBoardRole().getName()));
            if (alreadyHasPM) {
                throw new IllegalArgumentException("Board đã có Project Manager. Mỗi board chỉ có 1 Project Manager.");
            }
        }

        member.setBoardRole(newRole);
        boardMemberRepository.save(member);
        log.info("Updated role of user {} on board {} to {}", userId, boardId, roleName);

        // Gửi thông báo cho thành viên biết vai trò mới
        try {
            BoardEntity board = member.getBoard();
            String boardName = board != null ? board.getName() : "board";
            String notifyMsg = "Vai trò của bạn trong dự án \"" + boardName + "\" đã được cập nhật thành "
                    + roleName + ".";
            notificationService.createNotification(
                    "role_changed",
                    "Cập nhật vai trò",
                    notifyMsg,
                    userId,
                    board != null ? board.getId() : null,
                    null,
                    userId,
                    "{}",
                    roleName,
                    boardName
            );
        } catch (Exception e) {
            log.warn("Failed to create role change notification: {}", e.getMessage());
        }
    }
}
