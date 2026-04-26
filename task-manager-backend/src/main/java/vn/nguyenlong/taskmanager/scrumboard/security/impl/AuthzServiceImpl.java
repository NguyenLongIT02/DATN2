package vn.nguyenlong.taskmanager.scrumboard.security.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.nguyenlong.taskmanager.core.auth.entity.Role;
import vn.nguyenlong.taskmanager.core.auth.enums.RoleType;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRoleRepository;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardMemberEntity;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardRoleEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardMemberRepository;
import vn.nguyenlong.taskmanager.scrumboard.security.AuthzService;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthzServiceImpl implements AuthzService {

    private final BoardMemberRepository boardMemberRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    public boolean isBoardOwner(Long userId, Long boardId) {
        // 1. Global ADMIN có quyền PM trên tất cả board
        if (hasGlobalAdminRole(userId)) {
            return true;
        }
        
        // 2. Kiểm tra board Project Manager
        return boardMemberRepository.findByBoardIdAndUserIdWithRole(boardId, userId)
                .map(BoardMemberEntity::getBoardRole)
                .map(role -> role != null && "Project Manager".equalsIgnoreCase(role.getName()))
                .orElse(false);
    }
    
    /**
     * Check if user is board Project Manager or Team Lead
     */
    private boolean isBoardPMOrTeamLead(Long userId, Long boardId) {
        // 1. Global ADMIN có quyền PM trên tất cả board
        if (hasGlobalAdminRole(userId)) {
            return true;
        }
        
        // 2. Kiểm tra board Project Manager hoặc Team Lead
        return boardMemberRepository.findByBoardIdAndUserIdWithRole(boardId, userId)
                .map(BoardMemberEntity::getBoardRole)
                .map(role -> role != null && 
                    ("Project Manager".equalsIgnoreCase(role.getName()) || "Team Lead".equalsIgnoreCase(role.getName())))
                .orElse(false);
    }
    
    @Override
    public boolean isBoardMember(Long userId, Long boardId) {
        // 1. Global ADMIN luôn là member
        if (hasGlobalAdminRole(userId)) {
            return true;
        }
        
        // 2. Kiểm tra board membership
        return boardMemberRepository.existsByBoardIdAndUserId(boardId, userId);
    }
    
    @Override
    public boolean canInviteMembers(Long userId, Long boardId) {
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canEditBoard(Long userId, Long boardId) {
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canDeleteBoard(Long userId, Long boardId) {
        // Only Project Manager can delete board (not Team Lead)
        return isBoardOwner(userId, boardId);
    }
    
    @Override
    public boolean hasGlobalAdminRole(Long userId) {
        Set<Role> roles = userRoleRepository.findRolesByUserId(userId);
        return roles.stream()
                .anyMatch(role -> role.getName() == RoleType.ADMIN);
    }
    
    // ========== LIST PERMISSIONS ==========
    
    @Override
    public boolean canCreateList(Long userId, Long boardId) {
        // Project Manager or Team Lead: có thể tạo list
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canEditList(Long userId, Long boardId) {
        // Project Manager or Team Lead: có thể sửa list
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canDeleteList(Long userId, Long boardId) {
        // Project Manager or Team Lead: có thể xóa list
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    // ========== CARD PERMISSIONS ==========
    
    @Override
    public boolean canCreateCard(Long userId, Long boardId) {
        // Project Manager or Team Lead: có thể tạo card (Member không được tạo)
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canEditCard(Long userId, Long boardId) {
        // Project Manager or Team Lead: có thể sửa card
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canDeleteCard(Long userId, Long boardId) {
        // Project Manager or Team Lead: có thể xóa card
        return isBoardPMOrTeamLead(userId, boardId);
    }
    
    @Override
    public boolean canUpdateCard(Long userId, Long boardId) {
        // MEMBER: có thể update card (thường là comment, checklist, label - tùy frontend)
        // Nhưng ở đây ta để là isBoardMember để họ có quyền cơ bản
        return isBoardMember(userId, boardId);
    }
    
    @Override
    public boolean canCategoryCard(Long userId, Long boardId) {
        // Only Project Manager or Team Lead can move cards between lists
        return isBoardPMOrTeamLead(userId, boardId);
    }
}


