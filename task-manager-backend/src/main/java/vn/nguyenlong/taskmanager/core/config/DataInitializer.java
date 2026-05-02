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
        log.info("Checking and migrating old data...");
        try {
            Integer oldExists = jdbcTemplate.queryForObject("SELECT count(*) FROM information_schema.tables WHERE table_name = 'tbl_task_dependency'", Integer.class);
            if (oldExists != null && oldExists > 0) {
                // Kiểm tra xem bảng mới đã có dữ liệu chưa
                Integer newCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tbl_phu_thuoc_cong_viec", Integer.class);
                if (newCount != null && newCount == 0) {
                    jdbcTemplate.execute("DROP TABLE tbl_phu_thuoc_cong_viec CASCADE");
                    jdbcTemplate.execute("ALTER TABLE tbl_task_dependency RENAME TO tbl_phu_thuoc_cong_viec");
                    log.info("✓ Successfully migrated data from tbl_task_dependency to tbl_phu_thuoc_cong_viec by renaming.");
                } else {
                    jdbcTemplate.execute("INSERT INTO tbl_phu_thuoc_cong_viec (id, created_at, created_by, updated_at, updated_by, predecessor_id, successor_id) SELECT id, created_at, created_by, updated_at, updated_by, predecessor_id, successor_id FROM tbl_task_dependency ON CONFLICT (id) DO NOTHING");
                    jdbcTemplate.execute("DROP TABLE tbl_task_dependency CASCADE");
                    log.info("✓ Successfully copied data to tbl_phu_thuoc_cong_viec and dropped old table.");
                }
            }
        } catch (Exception e) {
            log.warn("Table migration check failed: " + e.getMessage());
        }

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

        // Create all 5 boards with full workflow + dependencies
        for (int i = 0; i < projectNames.length; i++) {
            String pName = projectNames[i];
            createProjectBoard(longNguyen, users, pName, i, true); // All boards have workflow
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

        // All boards now have workflow
        ListEntity todoList = createList(savedBoard, "Cần làm", ListStatusType.TODO);
        ListEntity inProgressList = createList(savedBoard, "Đang làm", ListStatusType.IN_PROGRESS);
        ListEntity doneList = createList(savedBoard, "Hoàn thành", ListStatusType.DONE);

        // Create cards with full pipeline and dependencies
        createWorkflowCards(savedBoard, todoList, inProgressList, doneList, boardUsers, projectIndex);
        
        log.info("✓ Created project board: {}", projectName);
    }

    private void createWorkflowCards(BoardEntity board, ListEntity todoList, ListEntity inProgressList, 
                                     ListEntity doneList, List<User> boardUsers, int projectIndex) {
        
        // ============ DONE LIST - Các giai đoạn đầu đã hoàn thành ============
        CardEntity phase1 = createCardWithDeadline(doneList, "1. Khảo sát hệ thống và thu thập yêu cầu", 
            boardUsers, -20, 2);
        
        CardEntity phase2 = createCardWithDeadline(doneList, "2. Phân tích và đặc tả yêu cầu (SRS)", 
            boardUsers, -18, 2);
        
        CardEntity phase3 = createCardWithDeadline(doneList, "3. Thiết kế Use Case và Activity Diagram", 
            boardUsers, -15, 2);
        
        CardEntity phase4 = createCardWithDeadline(doneList, "4. Thiết kế Class Diagram và Sequence Diagram", 
            boardUsers, -12, 2);
        
        CardEntity phase5 = createCardWithDeadline(doneList, "5. Thiết kế cơ sở dữ liệu (ERD)", 
            boardUsers, -10, 2);
        
        CardEntity phase6 = createCardWithDeadline(doneList, "6. Thiết kế giao diện người dùng (UI/UX)", 
            boardUsers, -8, 2);
        
        // ============ IN_PROGRESS LIST - Đang phát triển ============
        CardEntity phase7 = createCardWithDeadline(inProgressList, "7. Xây dựng Backend API (Spring Boot)", 
            boardUsers, 2, 1);
        
        CardEntity phase8 = createCardWithDeadline(inProgressList, "8. Phát triển Frontend (React/Vue)", 
            boardUsers, 3, 1);
        
        CardEntity phase9 = createCardWithDeadline(inProgressList, "9. Tích hợp hệ thống thanh toán", 
            boardUsers, 5, 1);
        
        CardEntity phase10 = createCardWithDeadline(inProgressList, "10. Kiểm thử đơn vị (Unit Testing)", 
            boardUsers, 1, 1);
        
        // ============ TODO LIST - Các giai đoạn cuối cần làm ============
        // Overdue
        CardEntity overdueCard = createCardWithDeadline(todoList, "11. Fix bug nghiêm trọng [QUÁ HẠN]", 
            boardUsers, -2, 0);
        
        // Due soon
        CardEntity phase11 = createCardWithDeadline(todoList, "12. Kiểm thử tích hợp (Integration Testing)", 
            boardUsers, 2, 0);
        
        CardEntity phase12 = createCardWithDeadline(todoList, "13. Kiểm thử hệ thống (System Testing)", 
            boardUsers, 3, 0);
        
        // Normal
        CardEntity phase13 = createCardWithDeadline(todoList, "14. Tối ưu hiệu năng và bảo mật", 
            boardUsers, 7, 0);
        
        CardEntity phase14 = createCardWithDeadline(todoList, "15. Chuẩn bị môi trường Production", 
            boardUsers, 10, 0);
        
        CardEntity phase15 = createCardWithDeadline(todoList, "16. Deploy lên Production Server", 
            boardUsers, 12, 0);
        
        CardEntity phase16 = createCardWithDeadline(todoList, "17. Kiểm thử chấp nhận (UAT)", 
            boardUsers, 14, 0);
        
        CardEntity phase17 = createCardWithDeadline(todoList, "18. Bàn giao tài liệu và hướng dẫn sử dụng", 
            boardUsers, 16, 0);
        
        // ============ DEPENDENCIES - Pipeline workflow cho TẤT CẢ boards ============
        // Phase 7 (Backend) phải đợi Phase 6 (UI/UX) xong
        createDependency(phase7, phase6);
        
        // Phase 8 (Frontend) phải đợi Phase 7 (Backend) xong
        createDependency(phase8, phase7);
        
        // Phase 9 (Thanh toán) phải đợi Phase 7 (Backend) xong
        createDependency(phase9, phase7);
        
        // Phase 10 (Unit Testing) phải đợi Phase 7 (Backend) xong
        createDependency(phase10, phase7);
        
        // Phase 11 (Fix bug) phải đợi Phase 8 (Frontend) xong
        createDependency(overdueCard, phase8);
        
        // Phase 12 (Integration Testing) phải đợi Phase 10 (Unit Testing) xong
        createDependency(phase11, phase10);
        
        // Phase 13 (System Testing) phải đợi Phase 12 (Integration Testing) xong
        createDependency(phase12, phase11);
        
        // Phase 14 (Tối ưu) phải đợi Phase 13 (System Testing) xong
        createDependency(phase13, phase12);
        
        // Phase 15 (Chuẩn bị Production) phải đợi Phase 14 (Tối ưu) xong
        createDependency(phase14, phase13);
        
        // Phase 16 (Deploy) phải đợi Phase 15 (Chuẩn bị Production) xong
        createDependency(phase15, phase14);
        
        // Phase 17 (UAT) phải đợi Phase 16 (Deploy) xong
        createDependency(phase16, phase15);
        
        // Phase 18 (Bàn giao) phải đợi Phase 17 (UAT) xong
        createDependency(phase17, phase16);
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

        // Phase 1: Khảo sát
        if (title.contains("1.") && title.contains("khảo sát")) {
            items = new String[]{"Phỏng vấn stakeholder", "Khảo sát người dùng cuối", "Phân tích đối thủ cạnh tranh"};
        } 
        // Phase 2: Phân tích SRS
        else if (title.contains("2.") && (title.contains("phân tích") || title.contains("srs"))) {
            items = new String[]{"Liệt kê yêu cầu chức năng", "Xác định yêu cầu phi chức năng", "Viết tài liệu SRS"};
        } 
        // Phase 3: Use Case
        else if (title.contains("3.") && title.contains("use case")) {
            items = new String[]{"Xác định Actor", "Vẽ Use Case Diagram", "Vẽ Activity Diagram"};
        } 
        // Phase 4: Class & Sequence Diagram
        else if (title.contains("4.") && (title.contains("class") || title.contains("sequence"))) {
            items = new String[]{"Thiết kế Class Diagram", "Vẽ Sequence Diagram", "Review với team"};
        } 
        // Phase 5: Database
        else if (title.contains("5.") && (title.contains("database") || title.contains("erd"))) {
            items = new String[]{"Thiết kế ERD", "Tạo bảng và quan hệ", "Tối ưu Index"};
        } 
        // Phase 6: UI/UX
        else if (title.contains("6.") && (title.contains("giao diện") || title.contains("ui/ux"))) {
            items = new String[]{"Vẽ Wireframe", "Thiết kế Mockup", "Tạo Prototype"};
        } 
        // Phase 7: Backend
        else if (title.contains("7.") && title.contains("backend")) {
            items = new String[]{"Setup Spring Boot Project", "Thiết kế API Endpoints", "Lập trình Controller/Service/Repository"};
        } 
        // Phase 8: Frontend
        else if (title.contains("8.") && title.contains("frontend")) {
            items = new String[]{"Setup React/Vue Project", "Dựng Component Layout", "Tích hợp API Backend"};
        } 
        // Phase 9: Thanh toán
        else if (title.contains("9.") && title.contains("thanh toán")) {
            items = new String[]{"Tích hợp Payment Gateway", "Test Sandbox Environment", "Xử lý Webhook Callback"};
        } 
        // Phase 10: Unit Testing
        else if (title.contains("10.") && title.contains("unit")) {
            items = new String[]{"Viết Unit Test cho Service", "Đạt 80% Code Coverage", "Chạy Test trên CI/CD"};
        } 
        // Phase 11: Fix bug
        else if (title.contains("11.") && title.contains("bug")) {
            items = new String[]{"Tái hiện lỗi", "Debug và tìm root cause", "Viết bản vá và test lại"};
        } 
        // Phase 12: Integration Testing
        else if (title.contains("12.") && title.contains("integration")) {
            items = new String[]{"Test API Integration", "Test Database Connection", "Test Third-party Services"};
        } 
        // Phase 13: System Testing
        else if (title.contains("13.") && title.contains("system")) {
            items = new String[]{"Test toàn bộ luồng nghiệp vụ", "Test trên nhiều trình duyệt", "Test trên mobile"};
        } 
        // Phase 14: Tối ưu
        else if (title.contains("14.") && title.contains("tối ưu")) {
            items = new String[]{"Profiling Performance", "Tối ưu Query Database", "Kiểm tra Security Vulnerabilities"};
        } 
        // Phase 15: Chuẩn bị Production
        else if (title.contains("15.") && title.contains("chuẩn bị")) {
            items = new String[]{"Cấu hình Docker/Docker Compose", "Setup CI/CD Pipeline", "Cấu hình Nginx/Load Balancer"};
        } 
        // Phase 16: Deploy
        else if (title.contains("16.") && title.contains("deploy")) {
            items = new String[]{"Build Production", "Deploy lên Server", "Kiểm tra Health Check"};
        } 
        // Phase 17: UAT
        else if (title.contains("17.") && title.contains("uat")) {
            items = new String[]{"Chuẩn bị Test Case UAT", "Khách hàng test chấp nhận", "Thu thập feedback"};
        } 
        // Phase 18: Bàn giao
        else if (title.contains("18.") && title.contains("bàn giao")) {
            items = new String[]{"Viết tài liệu hướng dẫn sử dụng", "Viết tài liệu kỹ thuật", "Đào tạo người dùng"};
        } 
        // Default
        else {
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
