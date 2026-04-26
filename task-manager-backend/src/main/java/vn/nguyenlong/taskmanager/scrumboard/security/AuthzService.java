package vn.nguyenlong.taskmanager.scrumboard.security;

public interface AuthzService {
    // Basic permissions
    boolean isBoardOwner(Long userId, Long boardId);
    boolean isBoardMember(Long userId, Long boardId);
    boolean hasGlobalAdminRole(Long userId);
    
    // Board management permissions (OWNER only)
    boolean canInviteMembers(Long userId, Long boardId);
    boolean canEditBoard(Long userId, Long boardId);
    boolean canDeleteBoard(Long userId, Long boardId);
    
    // List permissions
    boolean canCreateList(Long userId, Long boardId);
    boolean canEditList(Long userId, Long boardId);
    boolean canDeleteList(Long userId, Long boardId);
    
    // Card permissions
    boolean canCreateCard(Long userId, Long boardId);
    boolean canEditCard(Long userId, Long boardId);
    boolean canDeleteCard(Long userId, Long boardId);
    boolean canUpdateCard(Long userId, Long boardId);  // MEMBER can do this
    boolean canCategoryCard(Long userId, Long boardId); // MEMBER can do this
}


