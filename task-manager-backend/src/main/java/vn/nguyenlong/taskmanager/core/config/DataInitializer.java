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
        
        // ============ DONE LIST - Các công việc đã hoàn thành ============
        CardEntity doneCard1 = createCardWithDeadline(doneList, "Khảo sát và thu thập yêu cầu", 
            boardUsers, -15, 2);
        
        CardEntity doneCard2 = createCardWithDeadline(doneList, "Phân tích và đặc tả yêu cầu phần mềm (SRS)", 
            boardUsers, -12, 2);
        
        CardEntity doneCard3 = createCardWithDeadline(doneList, "Thiết kế Use Case Diagram", 
            boardUsers, -10, 2);
        
        CardEntity doneCard4 = createCardWithDeadline(doneList, "Thiết kế Class Diagram và Sequence Diagram", 
            boardUsers, -8, 2);
        
        CardEntity doneCard5 = createCardWithDeadline(doneList, "Thiết kế Database Schema (ERD)", 
            boardUsers, -6, 2);
        
        // ============ IN_PROGRESS LIST - Đang thực hiện ============
        CardEntity inProgressCard1 = createCardWithDeadline(inProgressList, "Thiết kế giao diện (UI/UX Mockup)", 
            boardUsers, 2, 1);
        
        CardEntity inProgressCard2 = createCardWithDeadline(inProgressList, "Xây dựng API Backend (RESTful)", 
            boardUsers, 3, 1);
        
        CardEntity inProgressCard3 = createCardWithDeadline(inProgressList, "Phát triển Frontend (React/Vue)", 
            boardUsers, 5, 1);
        
        CardEntity inProgressCard4 = createCardWithDeadline(inProgressList, "Tích hợp thanh toán trực tuyến", 
            boardUsers, 1, 1);
        
        // ============ TODO LIST - Cần làm ============
        // Overdue card
        CardEntity overdueCard = createCardWithDeadline(todoList, "Fix bug nghiêm trọng - Lỗi đăng nhập [QUÁ HẠN]", 
            boardUsers, -2, 0);
        
        // Due soon cards
        CardEntity dueSoonCard1 = createCardWithDeadline(todoList, "Viết Unit Tests cho Backend", 
            boardUsers, 2, 0);
        
        CardEntity dueSoonCard2 = createCardWithDeadline(todoList, "Kiểm thử tích hợp (Integration Testing)", 
            boardUsers, 3, 0);
        
        // Normal cards
        CardEntity normalCard1 = createCardWithDeadline(todoList, "Tối ưu hiệu năng và bảo mật", 
            boardUsers, 8, 0);
        
        CardEntity normalCard2 = createCardWithDeadline(todoList, "Viết tài liệu API (Swagger/Postman)", 
            boardUsers, 10, 0);
        
        CardEntity normalCard3 = createCardWithDeadline(todoList, "Chuẩn bị môi trường Deploy (Docker/CI-CD)", 
            boardUsers, 12, 0);
        
        CardEntity normalCard4 = createCardWithDeadline(todoList, "Deploy lên Production Server", 
            boardUsers, 15, 0);
        
        // ============ DEPENDENCIES - Chỉ cho 2 board đầu tiên ============
        if (projectIndex <= 1) {
            // Tối ưu phải đợi API Backend hoàn thành
            createDependency(normalCard1, inProgressCard2);
            
            // Viết Unit Tests phải đợi Database Schema xong
            createDependency(dueSoonCard1, doneCard5);
            
            // Viết tài liệu API phải đợi Unit Tests xong
            createDependency(normalCard2, dueSoonCard1);
            
            // Fix bug phải đợi Frontend phát triển xong
            createDependency(overdueCard, inProgressCard3);
            
            // Deploy phải đợi tối ưu xong
            createDependency(normalCard4, normalCard1);
            
            // Integration Testing phải đợi UI/UX xong
            createDependency(dueSoonCard2, inProgressCard1);
        }
    }

    private void createStandardCards(BoardEntity board, ListEntity todoList, ListEntity inProgressList, 
                                     ListEntity doneList, List<User> boardUsers, int projectIndex) {
        
        // ============ DONE LIST ============
        createCardWithDeadline(doneList, "Nghiên cứu công nghệ và framework", boardUsers, -12, 2);
        createCardWithDeadline(doneList, "Thiết kế kiến trúc hệ thống", boardUsers, -9, 2);
        createCardWithDeadline(doneList, "Setup môi trường phát triển", boardUsers, -7, 2);
        
        // ============ IN_PROGRESS LIST ============
        createCardWithDeadline(inProgressList, "Phát triển module quản lý người dùng", boardUsers, 3, 1);
        createCardWithDeadline(inProgressList, "Xây dựng dashboard và báo cáo", boardUsers, 4, 1);
        createCardWithDeadline(inProgressList, "Kiểm thử chức năng (Functional Testing)", boardUsers, 6, 1);
        
        // ============ TODO LIST ============
        createCardWithDeadline(todoList, "Tối ưu hóa truy vấn Database", boardUsers, 8, 0);
        createCardWithDeadline(todoList, "Cấu hình bảo mật và phân quyền", boardUsers, 10, 0);
        createCardWithDeadline(todoList, "Viết tài liệu hướng dẫn sử dụng", boardUsers, 13, 0);
        createCardWithDeadline(todoList, "Triển khai lên Production", boardUsers, 15, 0);
        createCardWithDeadline(todoList, "Bảo trì và nâng cấp tính năng", boardUsers, 20, 0);
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

        if (title.contains("khảo sát") || title.contains("thu thập")) {
            items = new String[]{"Phỏng vấn stakeholder", "Khảo sát người dùng", "Phân tích đối thủ cạnh tranh"};
        } else if (title.contains("phân tích") || title.contains("đặc tả") || title.contains("srs")) {
            items = new String[]{"Liệt kê yêu cầu chức năng", "Xác định yêu cầu phi chức năng", "Viết tài liệu SRS"};
        } else if (title.contains("use case")) {
            items = new String[]{"Xác định Actor", "Vẽ Use Case Diagram", "Mô tả chi tiết Use Case"};
        } else if (title.contains("class diagram") || title.contains("sequence")) {
            items = new String[]{"Thiết kế Class Diagram", "Vẽ Sequence Diagram", "Review với team"};
        } else if (title.contains("database") || title.contains("erd") || title.contains("schema")) {
            items = new String[]{"Thiết kế ERD", "Tạo bảng và quan hệ", "Tối ưu Index và Query"};
        } else if (title.contains("giao diện") || title.contains("ui/ux") || title.contains("mockup")) {
            items = new String[]{"Vẽ Wireframe", "Thiết kế Mockup", "Tạo Prototype tương tác"};
        } else if (title.contains("api") || title.contains("backend") || title.contains("restful")) {
            items = new String[]{"Thiết kế API Endpoints", "Lập trình Controller/Service", "Viết Unit Test"};
        } else if (title.contains("frontend") || title.contains("react") || title.contains("vue")) {
            items = new String[]{"Dựng Component Layout", "Tích hợp API", "Kiểm tra Responsive"};
        } else if (title.contains("thanh toán") || title.contains("payment")) {
            items = new String[]{"Tích hợp Payment Gateway", "Test Sandbox", "Xử lý Webhook"};
        } else if (title.contains("unit test")) {
            items = new String[]{"Viết Test Case", "Đạt 80% Code Coverage", "Chạy CI/CD Pipeline"};
        } else if (title.contains("integration") || title.contains("tích hợp")) {
            items = new String[]{"Test API Integration", "Test Database Connection", "Test Third-party Services"};
        } else if (title.contains("tối ưu") || title.contains("hiệu năng") || title.contains("bảo mật")) {
            items = new String[]{"Profiling Performance", "Tối ưu Query", "Kiểm tra Security Vulnerabilities"};
        } else if (title.contains("tài liệu") || title.contains("swagger") || title.contains("postman")) {
            items = new String[]{"Viết API Documentation", "Tạo Postman Collection", "Hướng dẫn sử dụng"};
        } else if (title.contains("deploy") || title.contains("triển khai") || title.contains("docker") || title.contains("ci-cd")) {
            items = new String[]{"Cấu hình Docker", "Setup CI/CD Pipeline", "Deploy lên Server"};
        } else if (title.contains("bug") || title.contains("fix") || title.contains("lỗi")) {
            items = new String[]{"Tái hiện lỗi", "Debug và tìm nguyên nhân", "Viết bản vá và test"};
        } else if (title.contains("nghiên cứu") || title.contains("setup")) {
            items = new String[]{"Nghiên cứu tài liệu", "So sánh các giải pháp", "Quyết định công nghệ"};
        } else if (title.contains("kiểm thử") || title.contains("testing")) {
            items = new String[]{"Viết Test Plan", "Thực hiện Test Cases", "Báo cáo Bug"};
        } else if (title.contains("bảo trì") || title.contains("nâng cấp")) {
            items = new String[]{"Monitor hệ thống", "Fix bug phát sinh", "Cập nhật tính năng mới"};
        } else {
            items = new String[]{"Lên kế hoạch", "Thực hiện công việc", "Review và hoàn thiện"};
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
