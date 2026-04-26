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
                .or(() -> boardRoleRepository.findByBoardIdAndName(boardId, "MEMBER"))
                .orElseThrow(() -> new NotFoundException("Default MEMBER role not found for board " + boardId));

        addMemberToBoard(boardId, userId, null, defaultMemberRole.getId());
    }

    public void addMemberToBoard(Long boardId, Long userId, Long invitedById, Long roleId) {
        // ✅ FIX: Check for existing membership with better error message
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
            member.setBoardRole(role);
        }

        member.setJoinedAt(java.time.Instant.now());
        
        try {
            boardMemberRepository.save(member);
            log.info("Successfully added user {} to board {} with role {}", userId, boardId, roleId);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // ✅ FIX: Handle database constraint violation (duplicate key)
            log.error("Database constraint violation when adding user {} to board {}: {}", 
                    userId, boardId, e.getMessage());
            throw new IllegalArgumentException("User is already a member of this board");
        }
    }

    public void removeMemberFromBoard(Long boardId, Long userId) {
        
        BoardMemberEntity member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found for board " + boardId + " and user " + userId));
        
        boardMemberRepository.delete(member);
    }

    public void updateMemberRole(Long boardId, Long userId, String role) {
        
        BoardMemberEntity member = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new NotFoundException("Member not found for board " + boardId + " and user " + userId));
        
        // This would need to be implemented with proper board role entity
        // For now, we'll just log the action
    }
}
