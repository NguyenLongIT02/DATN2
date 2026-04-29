package vn.nguyenlong.taskmanager.scrumboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.exception.payload.NotFoundException;

import vn.nguyenlong.taskmanager.core.util.EntityBase;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.CreateBoardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.request.UpdateBoardRequest;
import vn.nguyenlong.taskmanager.scrumboard.dto.response.BoardDto;
import vn.nguyenlong.taskmanager.scrumboard.entity.*;
import vn.nguyenlong.taskmanager.scrumboard.mapper.ScrumboardMapper;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardMemberRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRoleRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.ListRepository;
import vn.nguyenlong.taskmanager.scrumboard.repository.TaskDependencyRepository;
import vn.nguyenlong.taskmanager.scrumboard.security.AuthzService;
import vn.nguyenlong.taskmanager.scrumboard.service.MemberService;

import java.time.Instant;
import java.util.List;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final ListRepository listRepository;
    private final BoardRoleRepository boardRoleRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final MemberService memberService;
    private final ScrumboardMapper scrumboardMapper;
    private final AuthzService authzService;
    private final ActivityLogService activityLogService;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.ActivityLogRepository activityLogRepository;
    private final vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository notificationRepository;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.CommentRepository commentRepository;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.AttachmentRepository attachmentRepository;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.CardMemberRepository cardMemberRepository;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.CardLabelRepository cardLabelRepository;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.ChecklistItemRepository checklistItemRepository;
    private final vn.nguyenlong.taskmanager.scrumboard.repository.CardRepository cardRepository;
    private final TaskDependencyRepository taskDependencyRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<BoardDto> getAllBoards(Long currentUserId) {
        List<BoardEntity> boards;
        
        // Global ADMIN có thể thấy tất cả board
        if (authzService.hasGlobalAdminRole(currentUserId)) {
            boards = boardRepository.findAllWithLists();
        } else {
            // Chỉ lấy board mà user là member
            boards = boardRepository.findByUserId(currentUserId);
        }
        
        // Load cards for all lists efficiently
        for (BoardEntity board : boards) {
            if (board.getLists() != null && !board.getLists().isEmpty()) {
                // Get all list IDs for this board
                List<Long> listIds = board.getLists().stream()
                        .map(EntityBase::getId)
                        .toList();
                
                // Fetch all lists with their cards in one query
                List<ListEntity> listsWithCards = listRepository.findByIdsWithCards(listIds);
                
                // Update the board's lists with cards
                for (ListEntity list : board.getLists()) {
                    listsWithCards.stream()
                            .filter(l -> l.getId().equals(list.getId()))
                            .findFirst()
                            .ifPresent(l -> list.setCards(l.getCards()));
                }
            }
        }
        
        List<BoardDto> boardDtos = scrumboardMapper.toBoardDtoList(boards);
        
        // Populate current user's role for each board
        for (BoardDto dto : boardDtos) {
            boardMemberRepository.findByBoardIdAndUserIdWithRole(dto.getId(), currentUserId)
                    .ifPresent(member -> {
                        if (member.getBoardRole() != null) {
                            dto.setUserRole(member.getBoardRole().getName());
                        }
                    });
        }
        
        return boardDtos;
    }

    @Transactional(readOnly = true)
    public BoardDto getBoardById(Long id, Long currentUserId) {
        // Kiểm tra quyền truy cập board
        if (!authzService.isBoardMember(currentUserId, id)) {
            throw new AccessDeniedException("Access denied to board " + id);
        }
        
        // Fetch board with lists first
        BoardEntity board = boardRepository.findByIdWithLists(id)
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + id));
        
        // Load members separately
        boardRepository.findByIdWithMembers(id).ifPresent(b -> {
            board.setMembers(b.getMembers());
        });
        
        // Load cards for all lists
        if (board.getLists() != null && !board.getLists().isEmpty()) {
            List<Long> listIds = board.getLists().stream()
                    .map(EntityBase::getId)
                    .toList();
            
            List<ListEntity> listsWithCards = listRepository.findByIdsWithCards(listIds);
            
            for (ListEntity list : board.getLists()) {
                listsWithCards.stream()
                        .filter(l -> l.getId().equals(list.getId()))
                        .findFirst()
                        .ifPresent(l -> list.setCards(l.getCards()));
            }
            
            // ✅ FIX: Batch fetch dependencies for all cards
            List<CardEntity> allCards = board.getLists().stream()
                    .flatMap(list -> list.getCards().stream())
                    .toList();
            
            if (!allCards.isEmpty()) {
                List<Long> cardIds = allCards.stream()
                        .map(CardEntity::getId)
                        .toList();
                
                // Batch fetch all dependencies
                List<TaskDependencyEntity> allDependencies =
                        taskDependencyRepository.findBySuccessorIdIn(cardIds);
                
                // Group by successor ID
                java.util.Map<Long, List<TaskDependencyEntity>> dependenciesMap = 
                        allDependencies.stream()
                                .collect(java.util.stream.Collectors.groupingBy(
                                        d -> d.getSuccessor().getId()
                                ));
                
                // Set dependencies for each card
                allCards.forEach(card -> {
                    List<TaskDependencyEntity> deps = dependenciesMap.getOrDefault(card.getId(), List.of());
                    card.setDependencies(deps);
                });
            }
        }
        
        BoardDto dto = scrumboardMapper.toBoardDto(board);
        
        // Populate current user's role
        boardMemberRepository.findByBoardIdAndUserIdWithRole(id, currentUserId)
                .ifPresent(member -> {
                    if (member.getBoardRole() != null) {
                        dto.setUserRole(member.getBoardRole().getName());
                    }
                });
                
        return dto;
    }

    @Transactional(rollbackFor = Exception.class)
    public BoardDto createBoard(CreateBoardRequest request, Long currentUserId) {
        log.info("Creating board: {} for user: {}", request.getName(), currentUserId);
        
        if (boardRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Board with name '" + request.getName() + "' already exists");
        }

        // Validate dates
        Instant startDate = parseInstant(request.getStartDate());
        Instant endDate = parseInstant(request.getEndDate());
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // Tạo board
        BoardEntity board = new BoardEntity();
        board.setName(request.getName());
        board.setStartDate(startDate);
        board.setEndDate(endDate);
        BoardEntity savedBoard = boardRepository.save(board);
        
        // Tạo default roles cho board
        BoardRoleEntity pmRole = createDefaultPMRole(savedBoard);
        BoardRoleEntity teamLeadRole = createDefaultTeamLeadRole(savedBoard);
        BoardRoleEntity memberRole = createDefaultMemberRole(savedBoard);
        
        // Tự động thêm creator làm PM
        memberService.addMemberToBoard(savedBoard.getId(), currentUserId, currentUserId, pmRole.getId());
        
        log.info("Board created successfully with ID: {} and owner role assigned to user: {}", 
                savedBoard.getId(), currentUserId);
        
        activityLogService.logActivity(savedBoard.getId(), null, currentUserId, "CREATE_BOARD", "đã tạo dự án mới: " + savedBoard.getName());
        
        return scrumboardMapper.toBoardDto(savedBoard);
    }

    public BoardDto updateBoard(UpdateBoardRequest request, Long currentUserId) {
        // Kiểm tra quyền chỉnh sửa board
        if (!authzService.canEditBoard(currentUserId, request.getId())) {
            throw new AccessDeniedException("Access denied: Cannot edit board " + request.getId());
        }
        
        BoardEntity board = boardRepository.findById(request.getId())
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + request.getId()));

        if (!board.getName().equals(request.getName()) && boardRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Board with name '" + request.getName() + "' already exists");
        }

        // Validate dates
        Instant startDate = parseInstant(request.getStartDate());
        Instant endDate = parseInstant(request.getEndDate());
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        board.setName(request.getName());
        board.setStartDate(startDate);
        board.setEndDate(endDate);
        BoardEntity updatedBoard = boardRepository.save(board);
        
        activityLogService.logActivity(updatedBoard.getId(), null, currentUserId, "UPDATE_BOARD", "đã đổi tên dự án thành: " + updatedBoard.getName());
        
        return scrumboardMapper.toBoardDto(updatedBoard);
    }

    public void deleteBoard(Long id, Long currentUserId) {
        // Kiểm tra quyền xóa board
        if (!authzService.canDeleteBoard(currentUserId, id)) {
            throw new AccessDeniedException("Access denied: Cannot delete board " + id);
        }

        BoardEntity board = boardRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Board not found with id: " + id));

        log.info("Starting manual cleanup for board: {}", id);
        
        try {
            // 1. Dọn dẹp dữ liệu con của Card (Comment, Attachment, Checklist, Member, Label, Notification)
            commentRepository.deleteByBoardId(id);
            attachmentRepository.deleteByBoardId(id);
            checklistItemRepository.deleteByBoardId(id);
            cardMemberRepository.deleteByBoardId(id);
            cardLabelRepository.deleteByBoardId(id);
            notificationRepository.deleteByBoardId(id);
            taskDependencyRepository.deleteByBoardId(id);
            
            // 2. Xóa Thẻ bài (Card)
            cardRepository.deleteByBoardId(id);
            
            // 3. Xóa Cột (List)
            listRepository.deleteByBoardId(id);
            
            // 4. Xóa Lịch sử hoạt động (ActivityLog)
            activityLogRepository.deleteByBoardId(id);
            
            // 5. Xóa Thành viên & Vai trò của Board
            boardMemberRepository.deleteByBoardId(id);
            boardRoleRepository.deleteByBoardId(id);
            
            // Ép flush toàn bộ các lệnh xóa SQL trước đó
            entityManager.flush();

            // 6. Cuối cùng mới xóa Board bằng query trực tiếp
            boardRepository.deleteByIdCustom(id);
            
            // Flush and clear to ensure everyone is synced
            entityManager.flush();
            entityManager.clear();
            
            log.info("Board {} deleted successfully with all dependents.", id);
        } catch (Exception e) {
            log.error("Error during manual board cleanup: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete board due to data constraints: " + e.getMessage());
        }
    }

    
    /**
     * Tạo PM role cho board mới
     */
    private BoardRoleEntity createDefaultPMRole(BoardEntity board) {
        BoardRoleEntity pmRole = new BoardRoleEntity();
        pmRole.setBoard(board);
        pmRole.setName("Project Manager");
        pmRole.setDescription("Project Manager - Full access");
        pmRole.setIsDefault(false);
        pmRole.setCreatedBy("system");
        pmRole.setUpdatedBy("system");
        
        return boardRoleRepository.save(pmRole);
    }
    
    /**
     * Tạo TEAM_LEAD role cho board mới
     */
    private BoardRoleEntity createDefaultTeamLeadRole(BoardEntity board) {
        BoardRoleEntity teamLeadRole = new BoardRoleEntity();
        teamLeadRole.setBoard(board);
        teamLeadRole.setName("Team Lead");
        teamLeadRole.setDescription("Team Lead - Manage board and members");
        teamLeadRole.setIsDefault(false);
        teamLeadRole.setCreatedBy("system");
        teamLeadRole.setUpdatedBy("system");
        
        return boardRoleRepository.save(teamLeadRole);
    }
    
    /**
     * Tạo MEMBER role cho board mới
     */
    private BoardRoleEntity createDefaultMemberRole(BoardEntity board) {
        BoardRoleEntity memberRole = new BoardRoleEntity();
        memberRole.setBoard(board);
        memberRole.setName("Member");
        memberRole.setDescription("Board Member - Basic access");
        memberRole.setIsDefault(true);
        memberRole.setCreatedBy("system");
        memberRole.setUpdatedBy("system");
        
        return boardRoleRepository.save(memberRole);
    }
    
    /**
     * Parse ISO 8601 string to Instant
     */
    private Instant parseInstant(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        try {
            // Try parsing as ISO 8601 instant first (e.g., "2026-04-25T00:00:00Z")
            return Instant.parse(dateString);
        } catch (Exception e1) {
            try {
                // Try parsing as LocalDate (e.g., "2026-04-25")
                java.time.LocalDate localDate = java.time.LocalDate.parse(dateString);
                // Convert to Instant at start of day in system default timezone
                return localDate.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant();
            } catch (Exception e2) {
                log.warn("Failed to parse date: {}", dateString);
                return null;
            }
        }
    }
}
