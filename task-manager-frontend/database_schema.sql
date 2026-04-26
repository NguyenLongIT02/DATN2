-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. User Table
-- ========================================
CREATE TABLE tbl_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    profile_image_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- ========================================
-- 2. Role Table (Global Role)
-- ========================================
CREATE TABLE tbl_role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- e.g., ADMIN, USER
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Permission Table (Granular permissions)
CREATE TABLE tbl_permission (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL, -- board, card, list, comment, attachment
    action VARCHAR(50) NOT NULL,   -- create, read, update, delete, manage
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Role-Permission Mapping (RBAC)
CREATE TABLE tbl_role_permission (
    role_id BIGINT NOT NULL REFERENCES tbl_role(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES tbl_permission(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    PRIMARY KEY(role_id, permission_id)
);

-- ========================================
-- 3. User_Role Table (N:M)
-- ========================================
CREATE TABLE tbl_user_role (
    user_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES tbl_role(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    PRIMARY KEY(user_id, role_id)
);

CREATE TABLE tbl_auth_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES tbl_user(id),
    refresh_token_uuid UUID NOT NULL UNIQUE,
    device_type VARCHAR(10) NOT NULL, -- WEB, MOBILE
    device_id VARCHAR(100) NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    expired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    expires_at TIMESTAMP
);

-- ============================================================================
-- 2. BOARD MANAGEMENT TABLES
-- ============================================================================

-- Board Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_board (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Board Role Table (Board-specific roles)
CREATE TABLE tbl_board_role (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES tbl_board(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(board_id, name)
);

-- Board Role-Permission Mapping (Board-specific RBAC)
CREATE TABLE tbl_board_role_permission (
    board_role_id BIGINT NOT NULL REFERENCES tbl_board_role(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES tbl_permission(id) ON DELETE CASCADE,
    granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    PRIMARY KEY(board_role_id, permission_id)
);

-- Board Member Table (PBAC - Policy-Based Access Control)
CREATE TABLE tbl_board_member (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES tbl_board(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    board_role_id BIGINT REFERENCES tbl_board_role(id) ON DELETE SET NULL,
    -- Direct permissions override (PBAC)
    direct_permissions JSONB DEFAULT '{}',
    -- Policy conditions
    policy_conditions JSONB DEFAULT '{}',
    -- Member status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    joined_at TIMESTAMP DEFAULT NOW(),
    invited_by BIGINT REFERENCES tbl_user(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(board_id, user_id)
);

-- ============================================================================
-- 3. LIST MANAGEMENT TABLES
-- ============================================================================

-- Board List Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_list (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    board_id BIGINT NOT NULL REFERENCES tbl_board(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. CARD MANAGEMENT TABLES
-- ============================================================================

-- Card Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_card (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP,
    laneId BIGINT REFERENCES tbl_list(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Card Member Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_card_member (
    card_id BIGINT NOT NULL REFERENCES tbl_card(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    PRIMARY KEY(card_id, user_id)
);

-- ============================================================================
-- 5. LABEL MANAGEMENT TABLES
-- ============================================================================

-- Label Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_label (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Card Label Junction Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_card_label (
    card_id BIGINT NOT NULL REFERENCES tbl_card(id) ON DELETE CASCADE,
    label_id BIGINT NOT NULL REFERENCES tbl_label(id) ON DELETE CASCADE,
    PRIMARY KEY(card_id, label_id)
);

-- ============================================================================
-- 6. ATTACHMENT MANAGEMENT TABLES
-- ============================================================================

-- Attachment Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_attachment (
    id BIGSERIAL PRIMARY KEY,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_lastModified BIGINT NOT NULL,
    file_lastModifiedDate VARCHAR(100) NOT NULL,
    preview VARCHAR(500) NOT NULL,
    card_id BIGINT NOT NULL REFERENCES tbl_card(id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. COMMENT MANAGEMENT TABLES
-- ============================================================================

-- Comment Table (Khớp 100% với JSON structure - empty array)
CREATE TABLE tbl_comment (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL REFERENCES tbl_card(id) ON DELETE CASCADE
);

-- ============================================================================
-- 8. CHECKLIST MANAGEMENT TABLES
-- ============================================================================

-- Checklist Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_checklist (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL REFERENCES tbl_card(id) ON DELETE CASCADE
);

-- Checklist Item Table (Khớp 100% với JSON structure)
CREATE TABLE tbl_checklist_item (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    checklist_id BIGINT NOT NULL REFERENCES tbl_checklist(id) ON DELETE CASCADE
);

-- ============================================================================
-- 9. NOTIFICATION MANAGEMENT TABLES
-- ============================================================================

-- Notification Table
CREATE TABLE tbl_notification (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    board_id BIGINT REFERENCES tbl_board(id) ON DELETE CASCADE,
    card_id BIGINT REFERENCES tbl_card(id) ON DELETE CASCADE,
    actor_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- ============================================================================
-- 10. USER PREFERENCES TABLE
-- ============================================================================

-- User Preferences Table
CREATE TABLE tbl_user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(10) DEFAULT 'en',
    notifications JSONB DEFAULT '{
        "email": true,
        "push": true,
        "inApp": true,
        "cardUpdates": true,
        "boardUpdates": true,
        "memberUpdates": true
    }',
    dashboard JSONB DEFAULT '{
        "defaultView": "boards",
        "showCompletedTasks": false,
        "showArchivedBoards": false
    }',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    UNIQUE(user_id)
);

-- ============================================================================
-- 11. ACTIVITY LOG TABLE
-- ============================================================================

-- Activity Log Table
CREATE TABLE tbl_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES tbl_user(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    board_id BIGINT REFERENCES tbl_board(id) ON DELETE CASCADE,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- ============================================================================
-- 12. INSERT DEFAULT RBAC DATA
-- ============================================================================

-- Insert sample users (Match với JSON members structure)
INSERT INTO tbl_user (username, email, password, full_name, profile_image_url, status, is_verified) VALUES 
('admin', 'admin@example.com', '$2a$10$example_hash', 'Admin User', '/assets/images/avatar/A22.jpg', 'ACTIVE', TRUE),
('john_doe', 'john@example.com', '$2a$10$example_hash', 'John Doe', '/assets/images/avatar/A22.jpg', 'ACTIVE', TRUE),
('joe_root', 'joe.root@company.com', '$2a$10$example_hash', 'Joe Root', '/assets/images/avatar/A24.jpg', 'ACTIVE', TRUE),
('johnson', 'johnson@company.com', '$2a$10$example_hash', 'Johnson', '/assets/images/avatar/A23.jpg', 'ACTIVE', TRUE),
('monty_panesar', 'monty.panesar@company.com', '$2a$10$example_hash', 'Monty Panesar', '/assets/images/avatar/A25.jpg', 'ACTIVE', TRUE),
('darren_gough', 'darren.gough@company.com', '$2a$10$example_hash', 'Darren Gough', '/assets/images/avatar/A26.jpg', 'ACTIVE', TRUE);

-- Insert global roles
INSERT INTO tbl_role (name, created_by, updated_by) VALUES 
('ADMIN', 'system', 'system'),
('USER', 'system', 'system');

-- Insert permissions (matching frontend PermissionManager.ts)
INSERT INTO tbl_permission (name, resource, action, description) VALUES 
-- Board permissions
('board.view', 'board', 'read', 'View board'),
('board.edit', 'board', 'update', 'Edit board'),
('board.delete', 'board', 'delete', 'Delete board'),
('board.manage_settings', 'board', 'manage', 'Manage board settings'),

-- Member management permissions
('member.view', 'member', 'read', 'View members'),
('member.invite', 'member', 'create', 'Invite members'),
('member.remove', 'member', 'delete', 'Remove members'),
('member.change_roles', 'member', 'update', 'Change member roles'),

-- List permissions
('list.create', 'list', 'create', 'Create lists'),
('list.edit', 'list', 'update', 'Edit lists'),
('list.delete', 'list', 'delete', 'Delete lists'),
('list.reorder', 'list', 'update', 'Reorder lists'),

-- Card permissions
('card.create', 'card', 'create', 'Create cards'),
('card.edit', 'card', 'update', 'Edit cards'),
('card.delete', 'card', 'delete', 'Delete cards'),
('card.move', 'card', 'update', 'Move cards'),
('card.assign', 'card', 'update', 'Assign cards'),

-- Comment permissions
('comment.view', 'comment', 'read', 'View comments'),
('comment.add', 'comment', 'create', 'Add comments'),
('comment.edit', 'comment', 'update', 'Edit comments'),
('comment.delete', 'comment', 'delete', 'Delete comments'),

-- Attachment permissions
('attachment.view', 'attachment', 'read', 'View attachments'),
('attachment.add', 'attachment', 'create', 'Add attachments'),
('attachment.delete', 'attachment', 'delete', 'Delete attachments'),

-- Analytics permissions
('analytics.view', 'analytics', 'read', 'View analytics'),
('data.export', 'data', 'export', 'Export data'),

-- Automation permissions
('automation.create', 'automation', 'create', 'Create automations'),
('automation.edit', 'automation', 'update', 'Edit automations'),
('automation.delete', 'automation', 'delete', 'Delete automations');

-- Assign roles to users
INSERT INTO tbl_user_role (user_id, role_id) VALUES 
(1, 1), -- admin -> ADMIN
(2, 2), -- john_doe -> USER
(3, 2), -- joe_root -> USER
(4, 2), -- johnson -> USER
(5, 2), -- monty_panesar -> USER
(6, 2); -- darren_gough -> USER

-- Insert sample board (Khớp 100% với JSON structure)
INSERT INTO tbl_board (name) VALUES 
('Dashboard Frontend');

-- Insert default board roles (matching frontend TeamRole enum)
INSERT INTO tbl_board_role (board_id, name, description, is_default, created_by, updated_by) VALUES 
(1, 'owner', 'Board Owner - Full access', FALSE, 'admin', 'admin'),
(1, 'admin', 'Board Admin - Manage board and members', FALSE, 'admin', 'admin'),
(1, 'member', 'Board Member - Create and edit content', TRUE, 'admin', 'admin'),
(1, 'viewer', 'Board Viewer - Read-only access', FALSE, 'admin', 'admin');

-- Assign permissions to board roles (RBAC)
-- Owner permissions (all permissions)
INSERT INTO tbl_board_role_permission (board_role_id, permission_id, granted) 
SELECT 1, id, TRUE FROM tbl_permission;

-- Admin permissions (all except delete board)
INSERT INTO tbl_board_role_permission (board_role_id, permission_id, granted) 
SELECT 2, id, TRUE FROM tbl_permission WHERE name != 'board.delete';

-- Member permissions (basic permissions)
INSERT INTO tbl_board_role_permission (board_role_id, permission_id, granted) VALUES 
(3, (SELECT id FROM tbl_permission WHERE name = 'board.view'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'member.view'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'list.create'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'list.reorder'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'card.create'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'card.edit'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'card.move'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'card.assign'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'comment.view'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'comment.add'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'attachment.view'), TRUE),
(3, (SELECT id FROM tbl_permission WHERE name = 'attachment.add'), TRUE);

-- Viewer permissions (read-only)
INSERT INTO tbl_board_role_permission (board_role_id, permission_id, granted) VALUES 
(4, (SELECT id FROM tbl_permission WHERE name = 'board.view'), TRUE),
(4, (SELECT id FROM tbl_permission WHERE name = 'member.view'), TRUE),
(4, (SELECT id FROM tbl_permission WHERE name = 'comment.view'), TRUE),
(4, (SELECT id FROM tbl_permission WHERE name = 'attachment.view'), TRUE);

-- Add board members with roles (PBAC) - Match với JSON members
INSERT INTO tbl_board_member (board_id, user_id, board_role_id, invited_by) VALUES 
(1, 1, 1, 1), -- admin as owner
(1, 2, 3, 1), -- john_doe as member
(1, 3, 2, 1), -- joe_root as admin
(1, 4, 3, 1), -- johnson as member
(1, 5, 3, 1), -- monty_panesar as member
(1, 6, 4, 1); -- darren_gough as viewer

-- Insert sample lists (Khớp 100% với JSON structure)
INSERT INTO tbl_list (name, board_id) VALUES 
('In Progress', 1),
('Complete', 1),
('Pending', 1);

-- Insert sample cards (Khớp 100% với JSON structure)
INSERT INTO tbl_card (title, description, date, laneId) VALUES 
('Schedule the interview for React Js developer', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.', '2019-10-18T17:00:00.000Z', 1),
('Call Adam to review the documentation', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.', '2019-10-11T17:00:00.000Z', 1);

-- Insert sample labels (Khớp 100% với JSON structure)
INSERT INTO tbl_label (name, color) VALUES 
('High Priority', 'red'),
('Important', 'green'),
('Crema', '#0A8FDC'),
('Work Place', 'rgb(229, 231, 235)');

-- Insert card labels (Khớp 100% với JSON structure)
INSERT INTO tbl_card_label (card_id, label_id) VALUES 
(1, 1), -- Card 1: High Priority
(1, 4), -- Card 1: Work Place
(2, 1), -- Card 2: High Priority
(2, 2); -- Card 2: Important

-- Insert sample checklist (Khớp 100% với JSON structure)
INSERT INTO tbl_checklist (card_id) VALUES 
(1);

-- Insert sample checklist items (Khớp 100% với JSON structure)
INSERT INTO tbl_checklist_item (title, checked, checklist_id) VALUES 
('Meet Roman for further discussion.', FALSE, 1),
('Call Adam to check the latest development', FALSE, 1),
('Select Restaurant for meeting.', FALSE, 1);

-- Insert card members (Khớp 100% với JSON members)
INSERT INTO tbl_card_member (card_id, user_id) VALUES 
(1, 3), -- Card 1: Joe Root
(1, 6), -- Card 1: Darren Gough
(2, 4), -- Card 2: Johnson
(2, 5); -- Card 2: Monty Panesar

-- Insert sample notification
INSERT INTO tbl_notification (type, title, message, user_id, board_id, card_id, actor_id, created_by, updated_by) VALUES 
('card_created', 'New Card Created', 'A new card "Schedule the interview for React Js developer" has been created', 2, 1, 1, 1, 'admin', 'admin');

-- Insert user preferences
INSERT INTO tbl_user_preferences (user_id, theme, language, created_by, updated_by) VALUES 
(1, 'light', 'en', 'admin', 'admin'),
(2, 'dark', 'en', 'admin', 'admin');

-- ============================================================================
-- 13. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_user_email ON tbl_user(email);
CREATE INDEX idx_user_username ON tbl_user(username);
CREATE INDEX idx_user_status ON tbl_user(status);
CREATE INDEX idx_user_created_at ON tbl_user(created_at);

-- Auth token indexes
CREATE INDEX idx_auth_token_user_id ON tbl_auth_token(user_id);
CREATE INDEX idx_auth_token_uuid ON tbl_auth_token(refresh_token_uuid);
CREATE INDEX idx_auth_token_expires_at ON tbl_auth_token(expires_at);
CREATE INDEX idx_auth_token_revoked ON tbl_auth_token(revoked);

-- Role and permission indexes
CREATE INDEX idx_role_name ON tbl_role(name);
CREATE INDEX idx_permission_name ON tbl_permission(name);
CREATE INDEX idx_permission_resource_action ON tbl_permission(resource, action);

-- Board indexes
CREATE INDEX idx_board_created_at ON tbl_board(created_at);

-- Board role indexes
CREATE INDEX idx_board_role_board_id ON tbl_board_role(board_id);
CREATE INDEX idx_board_role_name ON tbl_board_role(name);

-- Board member indexes
CREATE INDEX idx_board_member_board_id ON tbl_board_member(board_id);
CREATE INDEX idx_board_member_user_id ON tbl_board_member(user_id);
CREATE INDEX idx_board_member_board_role_id ON tbl_board_member(board_role_id);
CREATE INDEX idx_board_member_status ON tbl_board_member(status);

-- List indexes
CREATE INDEX idx_list_board_id ON tbl_list(board_id);

-- Card indexes
CREATE INDEX idx_card_laneId ON tbl_card(laneId);
CREATE INDEX idx_card_created_at ON tbl_card(created_at);

-- Card member indexes
CREATE INDEX idx_card_member_card_id ON tbl_card_member(card_id);
CREATE INDEX idx_card_member_user_id ON tbl_card_member(user_id);

-- Label indexes
CREATE INDEX idx_label_name ON tbl_label(name);

-- Card label indexes
CREATE INDEX idx_card_label_card_id ON tbl_card_label(card_id);
CREATE INDEX idx_card_label_label_id ON tbl_card_label(label_id);

-- Attachment indexes
CREATE INDEX idx_attachment_card_id ON tbl_attachment(card_id);

-- Comment indexes
CREATE INDEX idx_comment_card_id ON tbl_comment(card_id);

-- Checklist indexes
CREATE INDEX idx_checklist_card_id ON tbl_checklist(card_id);

-- Checklist item indexes
CREATE INDEX idx_checklist_item_checklist_id ON tbl_checklist_item(checklist_id);

-- Notification indexes
CREATE INDEX idx_notification_user_id ON tbl_notification(user_id);
CREATE INDEX idx_notification_type ON tbl_notification(type);
CREATE INDEX idx_notification_is_read ON tbl_notification(is_read);
CREATE INDEX idx_notification_created_at ON tbl_notification(created_at);
CREATE INDEX idx_notification_board_id ON tbl_notification(board_id);
CREATE INDEX idx_notification_card_id ON tbl_notification(card_id);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON tbl_user_preferences(user_id);

-- Activity log indexes
CREATE INDEX idx_activity_log_user_id ON tbl_activity_log(user_id);
CREATE INDEX idx_activity_log_action ON tbl_activity_log(action);
CREATE INDEX idx_activity_log_entity_type ON tbl_activity_log(entity_type);
CREATE INDEX idx_activity_log_entity_id ON tbl_activity_log(entity_id);
CREATE INDEX idx_activity_log_board_id ON tbl_activity_log(board_id);
CREATE INDEX idx_activity_log_created_at ON tbl_activity_log(created_at);

-- ============================================================================
-- 14. TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON tbl_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_updated_at BEFORE UPDATE ON tbl_role
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permission_updated_at BEFORE UPDATE ON tbl_permission
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_updated_at BEFORE UPDATE ON tbl_board
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_role_updated_at BEFORE UPDATE ON tbl_board_role
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_list_updated_at BEFORE UPDATE ON tbl_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_updated_at BEFORE UPDATE ON tbl_card
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comment_updated_at BEFORE UPDATE ON tbl_comment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_updated_at BEFORE UPDATE ON tbl_checklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_item_updated_at BEFORE UPDATE ON tbl_checklist_item
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON tbl_user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 15. PERMISSION CHECKING FUNCTIONS
-- ============================================================================

-- Function to check if user has permission on board
CREATE OR REPLACE FUNCTION has_board_permission(
    p_user_id BIGINT,
    p_board_id BIGINT,
    p_permission_name VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Check direct permissions (PBAC)
    SELECT EXISTS(
        SELECT 1 
        FROM tbl_board_member bm
        JOIN tbl_board_role_permission brp ON bm.board_role_id = brp.board_role_id
        JOIN tbl_permission p ON brp.permission_id = p.id
        WHERE bm.user_id = p_user_id 
        AND bm.board_id = p_board_id 
        AND p.name = p_permission_name
        AND brp.granted = TRUE
        AND bm.status = 'active'
    ) INTO has_permission;
    
    -- If not found in board permissions, check global permissions
    IF NOT has_permission THEN
        SELECT EXISTS(
            SELECT 1 
            FROM tbl_user_role ur
            JOIN tbl_role_permission rp ON ur.role_id = rp.role_id
            JOIN tbl_permission p ON rp.permission_id = p.id
            WHERE ur.user_id = p_user_id 
            AND p.name = p_permission_name
            AND rp.granted = TRUE
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 16. USEFUL VIEWS
-- ============================================================================

-- User permissions view
CREATE VIEW v_user_permissions AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    b.id as board_id,
    b.name as board_name,
    br.name as board_role,
    p.name as permission_name,
    p.resource,
    p.action,
    CASE 
        WHEN brp.granted IS NOT NULL THEN brp.granted
        WHEN rp.granted IS NOT NULL THEN rp.granted
        ELSE FALSE
    END as has_permission
FROM tbl_user u
LEFT JOIN tbl_board_member bm ON u.id = bm.user_id AND bm.status = 'active'
LEFT JOIN tbl_board b ON bm.board_id = b.id
LEFT JOIN tbl_board_role br ON bm.board_role_id = br.id
LEFT JOIN tbl_board_role_permission brp ON br.id = brp.board_role_id
LEFT JOIN tbl_permission p ON brp.permission_id = p.id
LEFT JOIN tbl_user_role ur ON u.id = ur.user_id
LEFT JOIN tbl_role_permission rp ON ur.role_id = rp.role_id AND rp.permission_id = p.id
WHERE p.id IS NOT NULL;

-- Board member summary view
CREATE VIEW v_board_member_summary AS
SELECT 
    b.id as board_id,
    b.name as board_name,
    u.id as user_id,
    u.username,
    u.email,
    u.full_name,
    br.name as role_name,
    bm.status,
    bm.joined_at,
    COUNT(p.id) as permission_count
FROM tbl_board b
JOIN tbl_board_member bm ON b.id = bm.board_id
JOIN tbl_user u ON bm.user_id = u.id
LEFT JOIN tbl_board_role br ON bm.board_role_id = br.id
LEFT JOIN tbl_board_role_permission brp ON br.id = brp.board_role_id AND brp.granted = TRUE
LEFT JOIN tbl_permission p ON brp.permission_id = p.id
WHERE bm.status = 'active'
GROUP BY b.id, b.name, u.id, u.username, u.email, u.full_name, br.name, bm.status, bm.joined_at;

-- ============================================================================
-- RBAC/PBAC SCHEMA COMPLETED
-- ============================================================================
