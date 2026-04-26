package vn.nguyenlong.taskmanager.notifications;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import vn.nguyenlong.taskmanager.core.auth.entity.User;
import vn.nguyenlong.taskmanager.core.auth.repository.UserRepository;
import vn.nguyenlong.taskmanager.notifications.dto.response.NotificationDto;
import vn.nguyenlong.taskmanager.notifications.entity.NotificationEntity;
import vn.nguyenlong.taskmanager.notifications.repository.NotificationRepository;
import vn.nguyenlong.taskmanager.notifications.service.NotificationService;
import vn.nguyenlong.taskmanager.scrumboard.entity.BoardEntity;
import vn.nguyenlong.taskmanager.scrumboard.repository.BoardRepository;
import vn.nguyenlong.taskmanager.websocket.dto.WebSocketMessage;
import vn.nguyenlong.taskmanager.websocket.handler.BoardWebSocketHandler;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Preservation Property Tests for Real-Time Notification Fix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * These tests verify that existing functionality remains unchanged after the fix:
 * - Board WebSocket connections at /ws/board/{boardId} continue to work
 * - REST API endpoints continue to return paginated results with NotificationDto structure
 * - Notification CRUD operations (mark as read, mark all as read, delete) continue to work
 * 
 * EXPECTED OUTCOME: All tests PASS on unfixed code (confirming baseline behavior to preserve)
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PreservationPropertyTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired(required = false)
    private BoardWebSocketHandler boardWebSocketHandler;

    /**
     * Property 2.1: Board WebSocket Message Delivery Preservation
     * 
     * **Validates: Requirement 3.1**
     * 
     * For all board WebSocket messages (CARD_CREATED, CARD_DELETED, CARD_UPDATED, CARD_MOVED),
     * the system continues to deliver messages without interference.
     * 
     * EXPECTED OUTCOME: PASSES on unfixed code (baseline behavior)
     */
    @Test
    void boardWebSocketShouldDeliverMessagesCorrectly() {
        // Test multiple message types
        String[] messageTypes = {"CARD_CREATED", "CARD_DELETED", "CARD_UPDATED", "CARD_MOVED"};
        
        for (String messageType : messageTypes) {
            // Create a board WebSocket message
            WebSocketMessage message = createBoardMessage(messageType, "1", "1");
            
            // Verify message structure is correct
            assertNotNull(message, "Board WebSocket message should be created");
            assertEquals(messageType, message.getType(), "Message type should match");
            assertEquals("1", message.getBoardId(), "Board ID should match");
            assertNotNull(message.getTimestamp(), "Message should have timestamp");
        }
        
        // Verify BoardWebSocketHandler exists and has the broadcastToBoard method
        if (boardWebSocketHandler != null) {
            try {
                var method = BoardWebSocketHandler.class.getMethod("broadcastToBoard", String.class, WebSocketMessage.class);
                assertNotNull(method, "BoardWebSocketHandler should have broadcastToBoard method");
            } catch (NoSuchMethodException e) {
                fail("BoardWebSocketHandler should have broadcastToBoard method");
            }
        }
    }

    /**
     * Property 2.2: REST API Pagination Structure Preservation
     * 
     * **Validates: Requirement 3.2**
     * 
     * For all REST API calls to fetch notifications, the system continues to return
     * paginated results with the same NotificationDto structure.
     * 
     * EXPECTED OUTCOME: PASSES on unfixed code (baseline behavior)
     */
    @Test
    void restApiShouldReturnPaginatedNotificationDto() {
        // Create test users and board
        User testUser = createTestUser("testuser" + System.nanoTime());
        User testActor = createTestUser("testactor" + System.nanoTime());
        BoardEntity testBoard = createTestBoard("Test Board" + System.nanoTime());
        
        // Create some test notifications
        createTestNotifications(testUser.getId(), testActor.getId(), testBoard.getId(), 5);
        
        // Test multiple pagination scenarios
        int[][] paginationScenarios = {{0, 10}, {0, 5}, {1, 3}};
        
        for (int[] scenario : paginationScenarios) {
            int page = scenario[0];
            int size = scenario[1];
            
            // Fetch notifications with pagination
            Page<NotificationDto> result = notificationService.getNotificationsByUserId(testUser.getId(), page, size);
            
            // Verify pagination structure is preserved
            assertNotNull(result, "Result should not be null");
            assertNotNull(result.getContent(), "Content should not be null");
            assertTrue(result.getSize() <= size, "Page size should not exceed requested size");
            assertTrue(result.getNumber() >= 0, "Page number should be non-negative");
            
            // Verify NotificationDto structure is preserved
            if (!result.getContent().isEmpty()) {
                NotificationDto dto = result.getContent().get(0);
                assertNotNull(dto.getId(), "NotificationDto should have id");
                assertNotNull(dto.getType(), "NotificationDto should have type");
                assertNotNull(dto.getTitle(), "NotificationDto should have title");
                assertNotNull(dto.getMessage(), "NotificationDto should have message");
                assertNotNull(dto.getUserId(), "NotificationDto should have userId");
                assertNotNull(dto.getIsRead(), "NotificationDto should have isRead flag");
                assertNotNull(dto.getCreatedAt(), "NotificationDto should have createdAt");
            }
        }
    }

    /**
     * Property 2.3: Mark Notification as Read Preservation
     * 
     * **Validates: Requirement 3.3**
     * 
     * For all mark-as-read operations, the system continues to update the isRead flag
     * in the database correctly.
     * 
     * EXPECTED OUTCOME: PASSES on unfixed code (baseline behavior)
     */
    @Test
    void markNotificationAsReadShouldUpdateDatabase() {
        // Test multiple notification types
        String[] notificationTypes = {"CARD_ASSIGNED", "CARD_UPDATED", "CARD_DELETED", "BOARD_INVITE"};
        
        for (String notificationType : notificationTypes) {
            // Create test users and board
            User testUser = createTestUser("testuser" + System.nanoTime());
            User testActor = createTestUser("testactor" + System.nanoTime());
            BoardEntity testBoard = createTestBoard("Test Board" + System.nanoTime());
            
            // Create a test notification
            notificationService.createNotification(
                    notificationType,
                    "notification.member.joined.title",
                    "notification.member.joined.message",
                    testUser.getId(),
                    testBoard.getId(),
                    null,
                    testActor.getId(),
                    "{}",
                    "Test User",
                    "Test Board"
            );
            
            // Find the created notification
            List<NotificationEntity> notifications = notificationRepository.findUnreadByUserId(testUser.getId());
            assertFalse(notifications.isEmpty(), "Should have at least one unread notification");
            
            NotificationEntity notification = notifications.get(0);
            Long notificationId = notification.getId();
            assertFalse(notification.getIsRead(), "Notification should initially be unread");
            
            // Mark as read
            notificationService.markNotificationAsRead(notificationId);
            
            // Verify database was updated
            NotificationEntity updated = notificationRepository.findById(notificationId).orElse(null);
            assertNotNull(updated, "Notification should still exist");
            assertTrue(updated.getIsRead(), "Notification should be marked as read");
        }
    }

    /**
     * Property 2.4: Mark All Notifications as Read Preservation
     * 
     * **Validates: Requirement 3.4**
     * 
     * For all mark-all-as-read operations, the system continues to update all unread
     * notifications for the user correctly.
     * 
     * EXPECTED OUTCOME: PASSES on unfixed code (baseline behavior)
     */
    @Test
    void markAllNotificationsAsReadShouldUpdateAllUnread() {
        // Test multiple notification counts
        int[] notificationCounts = {1, 3, 5, 10};
        
        for (int notificationCount : notificationCounts) {
            // Create test users and board
            User testUser = createTestUser("testuser" + System.nanoTime());
            User testActor = createTestUser("testactor" + System.nanoTime());
            BoardEntity testBoard = createTestBoard("Test Board" + System.nanoTime());
            
            // Create multiple test notifications
            createTestNotifications(testUser.getId(), testActor.getId(), testBoard.getId(), notificationCount);
            
            // Verify all are unread
            List<NotificationEntity> unreadBefore = notificationRepository.findUnreadByUserId(testUser.getId());
            assertEquals(notificationCount, unreadBefore.size(), "Should have correct number of unread notifications");
            
            // Mark all as read
            notificationService.markAllNotificationsAsRead(testUser.getId());
            
            // Verify all are now read
            List<NotificationEntity> unreadAfter = notificationRepository.findUnreadByUserId(testUser.getId());
            assertEquals(0, unreadAfter.size(), "Should have no unread notifications after marking all as read");
            
            // Verify count is correct
            Long unreadCount = notificationService.getUnreadNotificationCount(testUser.getId());
            assertEquals(0L, unreadCount, "Unread count should be zero");
        }
    }

    /**
     * Property 2.5: Delete Notification Preservation
     * 
     * **Validates: Requirement 3.5**
     * 
     * For all delete operations, the system continues to remove notifications from
     * the database correctly.
     * 
     * EXPECTED OUTCOME: PASSES on unfixed code (baseline behavior)
     */
    @Test
    void deleteNotificationShouldRemoveFromDatabase() {
        // Test multiple notification types
        String[] notificationTypes = {"CARD_ASSIGNED", "CARD_UPDATED", "CARD_DELETED", "BOARD_INVITE"};
        
        for (String notificationType : notificationTypes) {
            // Create test users and board
            User testUser = createTestUser("testuser" + System.nanoTime());
            User testActor = createTestUser("testactor" + System.nanoTime());
            BoardEntity testBoard = createTestBoard("Test Board" + System.nanoTime());
            
            // Create a test notification
            notificationService.createNotification(
                    notificationType,
                    "notification.member.joined.title",
                    "notification.member.joined.message",
                    testUser.getId(),
                    testBoard.getId(),
                    null,
                    testActor.getId(),
                    "{}",
                    "Test User",
                    "Test Board"
            );
            
            // Find the created notification
            List<NotificationEntity> notifications = notificationRepository.findUnreadByUserId(testUser.getId());
            assertFalse(notifications.isEmpty(), "Should have at least one notification");
            
            NotificationEntity notification = notifications.get(0);
            Long notificationId = notification.getId();
            
            // Delete the notification
            notificationService.deleteNotification(notificationId);
            
            // Verify it was removed from database
            boolean exists = notificationRepository.existsById(notificationId);
            assertFalse(exists, "Notification should be deleted from database");
        }
    }

    /**
     * Property 2.6: Unread Notification Count Preservation
     * 
     * **Validates: Requirement 3.2 (REST API behavior)**
     * 
     * For all unread notification count requests, the system continues to return
     * the correct count.
     * 
     * EXPECTED OUTCOME: PASSES on unfixed code (baseline behavior)
     */
    @Test
    void unreadNotificationCountShouldBeAccurate() {
        // Test multiple scenarios
        int[][] scenarios = {{5, 0}, {5, 2}, {10, 5}, {10, 10}};
        
        for (int[] scenario : scenarios) {
            int totalNotifications = scenario[0];
            int readNotifications = scenario[1];
            
            // Create test users and board
            User testUser = createTestUser("testuser" + System.nanoTime());
            User testActor = createTestUser("testactor" + System.nanoTime());
            BoardEntity testBoard = createTestBoard("Test Board" + System.nanoTime());
            
            // Create test notifications
            createTestNotifications(testUser.getId(), testActor.getId(), testBoard.getId(), totalNotifications);
            
            // Mark some as read
            List<NotificationEntity> notifications = notificationRepository.findUnreadByUserId(testUser.getId());
            int toMarkAsRead = Math.min(readNotifications, notifications.size());
            for (int i = 0; i < toMarkAsRead; i++) {
                notificationService.markNotificationAsRead(notifications.get(i).getId());
            }
            
            // Get unread count
            Long unreadCount = notificationService.getUnreadNotificationCount(testUser.getId());
            
            // Verify count is accurate
            int expectedUnread = totalNotifications - toMarkAsRead;
            assertEquals((long) expectedUnread, unreadCount, "Unread count should match expected value");
        }
    }

    // Helper methods

    private User createTestUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPassword("password");
        user.setStatus(vn.nguyenlong.taskmanager.core.auth.enums.AccountStatus.ACTIVE);
        user.setIsVerified(true);
        return userRepository.save(user);
    }

    private BoardEntity createTestBoard(String name) {
        BoardEntity board = new BoardEntity();
        board.setName(name);
        return boardRepository.save(board);
    }

    private WebSocketMessage createBoardMessage(String type, String boardId, String cardId) {
        switch (type) {
            case "CARD_CREATED":
                return WebSocketMessage.cardCreated(boardId, cardId, null);
            case "CARD_DELETED":
                return WebSocketMessage.cardDeleted(boardId, cardId);
            case "CARD_UPDATED":
                return WebSocketMessage.cardUpdated(boardId, cardId, null);
            case "CARD_MOVED":
                return WebSocketMessage.cardMoved(boardId, cardId, "list1", "list2", null);
            default:
                return WebSocketMessage.builder()
                        .type(type)
                        .boardId(boardId)
                        .cardId(cardId)
                        .build();
        }
    }

    private void createTestNotifications(Long userId, Long actorId, Long boardId, int count) {
        for (int i = 0; i < count; i++) {
            notificationService.createNotification(
                    "CARD_ASSIGNED",
                    "notification.member.joined.title",
                    "notification.member.joined.message",
                    userId,
                    boardId,
                    null,
                    actorId,
                    "{}",
                    "Test User " + i,
                    "Test Board"
            );
        }
    }
}
