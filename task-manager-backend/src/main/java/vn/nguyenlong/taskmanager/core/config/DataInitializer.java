package vn.nguyenlong.taskmanager.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.auth.entity.Role;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.entity.UserRole;
import vn.nguyenlong.taskmanager.core.auth.enums.AccountStatus;
import vn.nguyenlong.taskmanager.core.auth.enums.RoleType;
import vn.nguyenlong.taskmanager.core.auth.repository.RoleRepository;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRoleRepository;
import vn.nguyenlong.taskmanager.scrumboard.entity.*;
import vn.nguyenlong.taskmanager.scrumboard.repository.*;
import vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository;
import vn.nguyenlong.taskmanager.notifications.entity.NotificationEntity;

import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final CardRepository cardRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CommentRepository commentRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final AttachmentRepository attachmentRepository;
    private final CardLabelRepository cardLabelRepository;
    private final CardMemberRepository cardMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final LabelRepository labelRepository;
    private final BoardRepository boardRepository;
    private final ListRepository listRepository;
    private final BoardRoleRepository boardRoleRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final NotificationRepository notificationRepository;
    private final TaskDependencyRepository taskDependencyRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("================================================================================");
        log.info("Starting Full System Cleanup & Data Initialization...");
        log.info("================================================================================");

        // ALWAYS Clean up old English tables if they exist
        cleanupOldTables();

        // 0. Kiểm tra xem đã có dữ liệu dự án chưa
        long boardCount = boardRepository.count();
        long cardCount = cardRepository.count();
        long userCount = userRepository.count();
        long labelCount = labelRepository.count();
        
        log.info("Current Database Status: {} boards, {} cards, {} labels, {} users found.", 
                 boardCount, cardCount, labelCount, userCount);

        // Skip if ANY data exists (except system users: nguyenlong + admin = 2 users)
        if (boardCount > 0 || labelCount > 0 || userCount > 2) {
            log.info(">>> DATA FOUND: Skipping initialization to preserve user changes.");
            return;
        }

        // 1. Thiết lập System Authentication để Audit ghi nhận là 'system'
        UsernamePasswordAuthenticationToken systemAuth = new UsernamePasswordAuthenticationToken(
                "system", null, java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_SYSTEM")));
        SecurityContextHolder.getContext().setAuthentication(systemAuth);

        try {
            log.info("Database is empty. Starting professional data seeding...");
            
            // 1. Reset triệt để (chỉ chạy khi DB trống để đảm bảo ID bắt đầu từ 1)
            resetAllData();
            
            // 2. Nạp các vai trò, người dùng và dữ liệu mẫu
            initializeRoles();
            initializeAdminUser();
            initializeLabels();
            initializeDemoData();
            
            log.info("✓ Initial seeding completed successfully.");
        } finally {
            SecurityContextHolder.clearContext();
        }

        log.info("================================================================================");
        log.info("System is now Clean, Professional and Ready for Demo!");
        log.info("================================================================================");
    }

    private void cleanupOldTables() {
        log.info("Cleaning up unused English tables...");
        String[] oldTables = {
            "tbl_card_checklist", "tbl_comment", "tbl_attachment", "tbl_card_member",
            "tbl_card_label", "tbl_card", "tbl_list", "tbl_board_member",
            "tbl_board_role", "tbl_auth_token", "tbl_board", "tbl_label",
            "tbl_activity_log", "tbl_notification", "tbl_user_role", "tbl_role", "tbl_user",
            "tbl_task_label", "tbl_task_member", "tbl_task_checklist" // Potential even older tables
        };
        
        for (String table : oldTables) {
            try {
                jdbcTemplate.execute("DROP TABLE IF EXISTS " + table + " CASCADE");
            } catch (Exception e) {
                // Ignore errors if table doesn't exist or cannot be dropped
            }
        }
    }

    private void resetAllData() {
        log.info("Full Clean Reset: Clearing all data and resetting IDs to 1...");
        try {
            // Danh sách các bảng mới (Vietnamese Schema)
            String[] newTables = {
                "tbl_muc_kiem_tra",
                "tbl_binh_luan",
                "tbl_tep_dinh_kem",
                "tbl_thanh_vien_the",
                "tbl_the_nhan",
                "tbl_the_cong_viec",
                "tbl_cot_cong_viec",
                "tbl_thanh_vien_bang",
                "tbl_vai_tro_bang",
                "tbl_ma_xac_thuc",
                "tbl_bang_cong_viec",
                "tbl_nhan",
                "tbl_nhat_ky_hoat_dong",
                "tbl_thong_bao",
                "tbl_nguoi_dung_vai_tro",
                "tbl_vai_tro"
            };
            
            for (String table : newTables) {
                jdbcTemplate.execute("TRUNCATE TABLE " + table + " RESTART IDENTITY CASCADE");
            }
            
            jdbcTemplate.execute("TRUNCATE TABLE tbl_nguoi_dung RESTART IDENTITY CASCADE");
            
            log.info("✓ Database schema updated to Vietnamese and data is clean.");
        } catch (Exception e) {
            log.error("Error during database reset: {}", e.getMessage());
        }
    }

    /**
     * Initialize default roles if they don't exist
     */
    private void initializeRoles() {
        log.info("Checking roles...");

        if (roleRepository.findByName(RoleType.ADMIN) == null) {
            log.info("ADMIN role not found. Creating ADMIN role...");
            Role adminRole = new Role();
            adminRole.setName(RoleType.ADMIN);
            adminRole.setCreatedBy("system");
            adminRole.setUpdatedBy("system");
            roleRepository.save(adminRole);
            log.info("✓ Created role: ADMIN (ID: {})", adminRole.getId());
        } else {
            log.info("ADMIN role already exists. Skipping.");
        }

        if (roleRepository.findByName(RoleType.USER) == null) {
            log.info("USER role not found. Creating USER role...");
            Role userRole = new Role();
            userRole.setName(RoleType.USER);
            userRole.setCreatedBy("system");
            userRole.setUpdatedBy("system");
            roleRepository.save(userRole);
            log.info("✓ Created role: USER (ID: {})", userRole.getId());
        } else {
            log.info("USER role already exists. Skipping.");
        }

        log.info("Role initialization completed. Total roles: {}", roleRepository.count());
    }

    /**
     * Initialize default admin user if it doesn't exist
     */
    private void initializeAdminUser() {
        log.info("Ensuring account 'nguyenlong' has ADMIN permissions...");

        // 1. Tìm hoặc tạo tài khoản nguyenlong
        User user = userRepository.findByUsername("nguyenlong").orElseGet(() -> {
            log.info("Account 'nguyenlong' missing. Creating now...");
            User u = User.builder()
                    .username("nguyenlong")
                    .email("vinhlongnguyen0210@gmail.com")
                    .password(passwordEncoder.encode("long@12345"))
                    .fullName("Nguyen Long")
                    .isVerified(true)
                    .status(AccountStatus.ACTIVE)
                    .build();
            u.setCreatedBy("system"); u.setUpdatedBy("system");
            return userRepository.save(u);
        });

        // 2. Luôn đảm bảo tài khoản này có quyền ADMIN
        Role adminRole = roleRepository.findByName(RoleType.ADMIN);
        if (adminRole != null) {
            // Kiểm tra xem đã có link trong tbl_user_role chưa
            if (userRoleRepository.findByUserIdAndRoleId(user.getId(), adminRole.getId()).isEmpty()) {
                UserRole ur = UserRole.builder()
                        .userId(user.getId())
                        .roleId(adminRole.getId())
                        .build();
                ur.setCreatedBy("system"); ur.setUpdatedBy("system");
                userRoleRepository.save(ur);
                log.info("✓ ADMIN role linked to 'nguyenlong'");
            }
        }

        // 3. Tạo tài khoản admin dự phòng nếu cần
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@taskmanager.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("System Administrator")
                    .isVerified(true)
                    .status(AccountStatus.ACTIVE)
                    .build();
            admin.setCreatedBy("system"); admin.setUpdatedBy("system");
            userRepository.save(admin);
        }
    }


    /**
     * Initialize default labels if they don't exist
     */
    private void initializeLabels() {
        log.info("Checking labels...");

        if (labelRepository.count() > 0) {
            log.info("Labels already exist. Skipping label initialization.");
            return;
        }

        log.info("No labels found. Creating default labels...");

        // Define default labels with colors
        String[][] defaultLabels = {
            {"Lỗi", "#f44336"},           // Red
            {"Tính năng", "#2196f3"},     // Blue
            {"Cải tiến", "#4caf50"},      // Green
            {"Tài liệu", "#ff9800"},      // Orange
            {"Thiết kế", "#9c27b0"},      // Purple
            {"Kiểm thử", "#00bcd4"},      // Cyan
            {"Ưu tiên cao", "#e91e63"},   // Pink
            {"Ưu tiên thấp", "#607d8b"}    // Blue Grey
        };

        for (String[] labelData : defaultLabels) {
            LabelEntity label = new LabelEntity();
            label.setName(labelData[0]);
            label.setColor(labelData[1]);
            label.setCreatedBy("system");
            label.setUpdatedBy("system");
            
            LabelEntity savedLabel = labelRepository.save(label);
            log.info("✓ Created label: {} with color {} (ID: {})", 
                    savedLabel.getName(), savedLabel.getColor(), savedLabel.getId());
        }

        log.info("Label initialization completed. Total labels: {}", labelRepository.count());
    }

    /**
     * Initialize demo data with 40 users and 5 big projects
     */
    @Transactional
    protected void initializeDemoData() {
        log.info("Checking demo data...");

        // 1. Dọn dẹp: Xóa các user clone nếu tồn tại
        userRepository.findAll().stream()
                .filter(u -> u.getEmail().contains("clone") || u.getEmail().contains("datn.com"))
                .forEach(u -> {
                    boardMemberRepository.deleteByUserId(u.getId());
                    userRoleRepository.deleteByUserId(u.getId());
                    userRepository.delete(u);
                    log.info("🗑 Đã xóa tài khoản clone: {}", u.getEmail());
                });

        log.info("Starting to seed demo data (40 users, 5 projects)...");

        String[] userNames = {
            "minhnguyen", "hoanganh", "quanghuy", "tuananh", "thanhdat", "ductrung", "phuonglinh", "thuyduong", "khanhlinh", "baongoc",
            "hoanglong", "vietanh", "quynhchi", "thaison", "minhduc", "ngocmai", "ducmanh", "thuha", "anhnhat", "lananh",
            "tienvu", "ngocanh", "vanhien", "thuytien", "minhthanh", "hongphuc", "vinhquang", "thanhtung", "minhquan", "duykhuong",
            "anhquan", "trungduc", "hailong", "ngoctram", "thuychi", "vananh", "thanhha", "minhtuan", "ngockhoa", "baochau"
        };

        // 1. Lấy hoặc Tạo tài khoản nguyenlong (Chủ dự án)
        User longNguyen = userRepository.findByUsername("nguyenlong")
                .orElseGet(() -> {
                    User u = User.builder()
                            .username("nguyenlong")
                            .email("vinhlongnguyen0210@gmail.com")
                            .password(passwordEncoder.encode("long@12345"))
                            .fullName("Nguyen Long")
                            .isVerified(true)
                            .status(AccountStatus.ACTIVE)
                            .build();
                    u.setCreatedBy("system"); u.setUpdatedBy("system");
                    User saved = userRepository.save(u);
                    
                    Role adminRole = roleRepository.findByName(RoleType.ADMIN);
                    if (adminRole != null) {
                        UserRole ur = UserRole.builder().userId(saved.getId()).roleId(adminRole.getId()).build();
                        ur.setCreatedBy("system"); ur.setUpdatedBy("system");
                        userRoleRepository.save(ur);
                    }
                    return saved;
                });

        // 2. Tạo 40 Users Demo
        String encodedDemoPassword = passwordEncoder.encode("demo123");
        Role userRole = roleRepository.findByName(RoleType.USER);
        
        List<User> users = IntStream.rangeClosed(1, 40)
                .mapToObj(i -> {
                    String username = userNames[i - 1];
                    return userRepository.findByUsername(username).orElseGet(() -> {
                        User u = User.builder()
                                .username(username)
                                .email(username + "@task.com")
                                .password(encodedDemoPassword)
                                .fullName(username)
                                .isVerified(true)
                                .status(AccountStatus.ACTIVE)
                                .build();
                        u.setCreatedBy("system"); u.setUpdatedBy("system");
                        User saved = userRepository.save(u);
                        
                        if (userRole != null) {
                            UserRole ur = UserRole.builder().userId(saved.getId()).roleId(userRole.getId()).build();
                            ur.setCreatedBy("system"); ur.setUpdatedBy("system");
                            userRoleRepository.save(ur);
                        }
                        return saved;
                    });
                }).collect(Collectors.toList());

        String[] projectNames = {
            "Website Đặt Đồ Ăn Nhanh (FastFood)",
            "Website Bán Xe Điện",
            "Website Đặt Lịch Khám Bệnh",
            "Web Quản Lý Xây Nhà Trọn Gói (FULLBD)",
            "Website Bán Xe Ô Tô"
        };

        // Create all 5 boards with workflow + dependencies
        for (int i = 0; i < projectNames.length; i++) {
            String pName = projectNames[i];
            boolean isWorkflowBoard = (i <= 2); // First 3 boards have full workflow
            
            createProjectBoard(longNguyen, users, pName, i, isWorkflowBoard);
        }
    }

    private void createProjectBoard(User owner, List<User> allUsers, String projectName, int projectIndex, boolean hasWorkflow) {
        log.info("Creating project board: {} (Workflow: {})", projectName, hasWorkflow);
        
        BoardEntity board = new BoardEntity();
        board.setName(projectName);
        board.setStartDate(Instant.parse("2026-04-20T00:00:00Z"));
        board.setEndDate(Instant.parse("2026-05-20T23:59:59Z"));
        board.setCreatedBy("system");
        board.setUpdatedBy("system");
        BoardEntity savedBoard = boardRepository.save(board);

        BoardRoleEntity ownerRole = new BoardRoleEntity(savedBoard, "Project Manager", "Chủ sở hữu dự án", false, new ArrayList<>());
        ownerRole.setCreatedBy("system");
        ownerRole.setUpdatedBy("system");
        ownerRole = boardRoleRepository.save(ownerRole);

        BoardRoleEntity memberRole = new BoardRoleEntity(savedBoard, "Member", "Thành viên", true, new ArrayList<>());
        memberRole.setCreatedBy("system");
        memberRole.setUpdatedBy("system");
        memberRole = boardRoleRepository.save(memberRole);

        addMember(savedBoard, owner, ownerRole);
        List<User> boardUsers = new ArrayList<>();
        boardUsers.add(owner);
        
        for (int j = 0; j < 10; j++) {
            User member = allUsers.get((projectIndex * 10 + j) % allUsers.size());
            if (!member.getUsername().equals(owner.getUsername())) {
                addMember(savedBoard, member, memberRole);
                boardUsers.add(member);
                
                createNotification(member, owner, savedBoard, 
                    "Bạn được mời tham gia: " + projectName,
                    "Nguyễn Long (Project Manager) đã mời bạn tham gia dự án \"" + projectName + "\" với vai trò Member.",
                    "BOARD_INVITATION");
            }
        }

        ListEntity todoList, inProgressList, doneList;
        
        if (hasWorkflow) {
            todoList = createList(savedBoard, "Cần làm", ListStatusType.TODO);
            inProgressList = createList(savedBoard, "Đang làm", ListStatusType.IN_PROGRESS);
            doneList = createList(savedBoard, "Hoàn thành", ListStatusType.DONE);
        } else {
            todoList = createList(savedBoard, "Cần làm", ListStatusType.NONE);
            inProgressList = createList(savedBoard, "Đang làm", ListStatusType.NONE);
            doneList = createList(savedBoard, "Hoàn thành", ListStatusType.NONE);
        }

        if (hasWorkflow) {
            createWorkflowCards(savedBoard, todoList, inProgressList, doneList, boardUsers, projectIndex);
        } else {
            createStandardCards(savedBoard, todoList, inProgressList, doneList, boardUsers, projectIndex);
        }
        
        log.info("✓ Created project board: {}", projectName);
    }

    private void createWorkflowCards(BoardEntity board, ListEntity todoList, ListEntity inProgressList, 
                                     ListEntity doneList, List<User> boardUsers, int projectIndex) {
        
        CardEntity doneCard1 = createCardWithDeadline(doneList, "Phân tích yêu cầu hệ thống", 
            boardUsers, -10, 2);
        
        CardEntity doneCard2 = createCardWithDeadline(doneList, "Thiết kế UI/UX", 
            boardUsers, -8, 2);
        
        CardEntity doneCard3 = createCardWithDeadline(doneList, "Thiết kế Database Schema", 
            boardUsers, -6, 2);
        
        CardEntity inProgressCard1 = createCardWithDeadline(inProgressList, "Xây dựng API Backend", 
            boardUsers, 2, 1);
        
        CardEntity inProgressCard2 = createCardWithDeadline(inProgressList, "Phát triển Frontend", 
            boardUsers, 5, 1);
        
        CardEntity inProgressCard3 = createCardWithDeadline(inProgressList, "Tích hợp thanh toán", 
            boardUsers, 1, 1);
        
        CardEntity overdueCard = createCardWithDeadline(todoList, "Fix bug nghiêm trọng [QUÁ HẠN]", 
            boardUsers, -2, 0);
        
        CardEntity dueSoonCard = createCardWithDeadline(todoList, "Viết Unit Tests", 
            boardUsers, 3, 0);
        
        CardEntity normalCard1 = createCardWithDeadline(todoList, "Tối ưu hiệu năng", 
            boardUsers, 10, 0);
        
        CardEntity normalCard2 = createCardWithDeadline(todoList, "Viết tài liệu API", 
            boardUsers, 12, 0);
        
        if (projectIndex <= 1) {
            createDependency(normalCard1, inProgressCard1);
            createDependency(dueSoonCard, doneCard3);
            createDependency(normalCard2, dueSoonCard);
            createDependency(overdueCard, inProgressCard2);
        }
    }

    private void createStandardCards(BoardEntity board, ListEntity todoList, ListEntity inProgressList, 
                                     ListEntity doneList, List<User> boardUsers, int projectIndex) {
        
        createCardWithDeadline(doneList, "Nghiên cứu công nghệ", boardUsers, -7, 2);
        createCardWithDeadline(doneList, "Thiết kế hệ thống", boardUsers, -5, 2);
        
        createCardWithDeadline(inProgressList, "Phát triển tính năng chính", boardUsers, 4, 1);
        createCardWithDeadline(inProgressList, "Kiểm thử hệ thống", boardUsers, 6, 1);
        
        createCardWithDeadline(todoList, "Tối ưu hóa", boardUsers, 8, 0);
        createCardWithDeadline(todoList, "Triển khai production", boardUsers, 15, 0);
        createCardWithDeadline(todoList, "Bảo trì và nâng cấp", boardUsers, 20, 0);
    }

    private CardEntity createCardWithDeadline(ListEntity list, String title, List<User> boardUsers, 
                                              int daysOffset, int checklistStatus) {
        CardEntity card = new CardEntity();
        card.setTitle(title);
        card.setList(list);
        card.setDate(Instant.now().plus(daysOffset, ChronoUnit.DAYS));
        card.setCreatedBy("system");
        card.setUpdatedBy("system");
        CardEntity savedCard = cardRepository.save(card);
        
        addSampleChecklist(savedCard, checklistStatus);
        
        List<LabelEntity> allLabels = labelRepository.findAll();
        if (!allLabels.isEmpty()) {
            int labelCount = 1 + (int)(Math.random() * 2);
            for (int i = 0; i < labelCount; i++) {
                LabelEntity randomLabel = allLabels.get((int)(Math.random() * allLabels.size()));
                if (!cardLabelRepository.existsByCardIdAndLabelId(savedCard.getId(), randomLabel.getId())) {
                    CardLabelEntity cl = new CardLabelEntity();
                    cl.setCard(savedCard);
                    cl.setLabel(randomLabel);
                    cardLabelRepository.save(cl);
                }
            }
        }
        
        int memberCount = 1 + (int)(Math.random() * 3);
        for (int i = 0; i < memberCount; i++) {
            User randomUser = boardUsers.get((int)(Math.random() * boardUsers.size()));
            if (!cardMemberRepository.existsByCardIdAndUserId(savedCard.getId(), randomUser.getId())) {
                CardMemberEntity cm = new CardMemberEntity();
                cm.setCard(savedCard);
                cm.setUser(randomUser);
                cardMemberRepository.save(cm);
            }
        }
        
        return savedCard;
    }

    private void addSampleChecklist(CardEntity card, int checklistStatus) {
        String title = card.getTitle().toLowerCase();
        String[] items;

        if (title.contains("phân tích") || title.contains("analysis")) {
            items = new String[]{"Nghiên cứu đối thủ", "Phác thảo sơ đồ quy trình", "Chốt yêu cầu với PM"};
        } else if (title.contains("thiết kế ui") || title.contains("interface") || title.contains("ui")) {
            items = new String[]{"Vẽ Wireframe", "Tạo Mockup màu sắc", "Thiết kế Prototype"};
        } else if (title.contains("database") || title.contains("db") || title.contains("schema")) {
            items = new String[]{"Thiết kế lược đồ ERD", "Tạo bảng và quan hệ", "Tối ưu hóa Index"};
        } else if (title.contains("api") || title.contains("backend")) {
            items = new String[]{"Thiết kế Swagger API", "Lập trình logic xử lý", "Viết Unit Test"};
        } else if (title.contains("frontend") || title.contains("page") || title.contains("phát triển")) {
            items = new String[]{"Dựng khung Layout", "Tích hợp API", "Kiểm tra Responsive"};
        } else if (title.contains("payment") || title.contains("thanh toán")) {
            items = new String[]{"Cài đặt SDK", "Tạo luồng Sandbox", "Xử lý Webhook"};
        } else if (title.contains("test") || title.contains("testing") || title.contains("kiểm thử")) {
            items = new String[]{"Viết Test Case", "Chạy Automation Test", "Báo cáo lỗi (Issue)"};
        } else if (title.contains("deploy") || title.contains("triển khai")) {
            items = new String[]{"Build dự án", "Cấu hình Docker/Nginx", "Kiểm tra môi trường Production"};
        } else if (title.contains("bug") || title.contains("fix")) {
            items = new String[]{"Tái hiện lỗi", "Phân tích nguyên nhân", "Viết bản vá (Patch)"};
        } else {
            items = new String[]{"Nghiên cứu tài liệu", "Thực hiện công việc", "Review kết quả"};
        }

        for (int i = 0; i < items.length; i++) {
            ChecklistItemEntity item = new ChecklistItemEntity();
            item.setCard(card);
            item.setTitle(items[i]);
            
            if (checklistStatus == 0) {
                item.setChecked(false);
            } else if (checklistStatus == 2) {
                item.setChecked(true);
            } else {
                item.setChecked(i == 0);
            }
            
            item.setCreatedBy("system");
            item.setUpdatedBy("system");
            checklistItemRepository.save(item);
        }
    }

    private void addMember(BoardEntity board, User user, BoardRoleEntity role) {
        BoardMemberEntity member = BoardMemberEntity.builder()
                .board(board)
                .user(user)
                .boardRole(role)
                .status("active")
                .joinedAt(board.getStartDate() != null ? board.getStartDate() : Instant.now())
                .build();
        member.setCreatedBy("system");
        member.setUpdatedBy("system");
        boardMemberRepository.save(member);
    }

    private void createNotification(User recipient, User actor, BoardEntity board,
                                    String title, String message, String type) {
        NotificationEntity notify = new NotificationEntity();
        notify.setUser(recipient);
        notify.setActor(actor);
        notify.setBoard(board);
        notify.setTitle(title);
        notify.setMessage(message);
        notify.setType(type);
        notify.setIsRead(false);
        notify.setCreatedAt(Instant.now());
        notify.setCreatedBy("system");
        notify.setUpdatedBy("system");
        notificationRepository.save(notify);
    }

    private ListEntity createList(BoardEntity board, String name, ListStatusType statusType) {
        ListEntity list = new ListEntity();
        list.setName(name);
        list.setBoard(board);
        list.setStatusType(statusType);
        list.setCreatedBy("system");
        list.setUpdatedBy("system");
        return listRepository.save(list);
    }

    private void createDependency(CardEntity successor, CardEntity predecessor) {
        TaskDependencyEntity dependency = new TaskDependencyEntity();
        dependency.setSuccessor(successor);
        dependency.setPredecessor(predecessor);
        dependency.setCreatedBy("system");
        dependency.setUpdatedBy("system");
        taskDependencyRepository.save(dependency);
        log.info("  → Dependency: \"{}\" depends on \"{}\"", successor.getTitle(), predecessor.getTitle());
    }
}
