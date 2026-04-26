/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unified Data Types for Backend Integration
 * This file consolidates all member and related types for consistency
 */

// ============================================================================
// UNIFIED ENUMS
// ============================================================================

export enum TeamRole {
  PM = 'pm',
  TEAM_LEAD = 'team_lead',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum NotificationType {
  CARD_CREATED = 'card_created',
  CARD_UPDATED = 'card_updated',
  CARD_MOVED = 'card_moved',
  CARD_DELETED = 'card_deleted',
  MEMBER_ASSIGNED = 'member_assigned',
  MEMBER_REMOVED = 'member_removed',
  BOARD_CREATED = 'board_created',
  BOARD_UPDATED = 'board_updated',
  BOARD_DELETED = 'board_deleted',
  LIST_CREATED = 'list_created',
  LIST_UPDATED = 'list_updated',
  LIST_DELETED = 'list_deleted',
  COMMENT_ADDED = 'comment_added',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_DELETED = 'comment_deleted',
  ATTACHMENT_ADDED = 'attachment_added',
  ATTACHMENT_DELETED = 'attachment_deleted',
  PERMISSION_CHANGED = 'permission_changed',
  ROLE_CHANGED = 'role_changed',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  SYSTEM_ALERT = 'system_alert'
}

// ============================================================================
// UNIFIED MEMBER TYPES
// ============================================================================

/**
 * Unified Member Type - Replaces both MemberObjType and TeamMember
 * This is the single source of truth for member data
 */
export interface UnifiedMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: TeamRole;
  joinedAt: string;
  lastActive: string;
  boards: number;
  tasks: number;
  isActive: boolean;
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    theme: 'light' | 'dark';
    language: string;
  };
}

/**
 * Board Member Relationship - Links members to boards with specific roles
 */
export interface UnifiedBoardMember {
  id: number;
  memberId: number;
  boardId: number;
  role: TeamRole;
  joinedAt: string;
  member: UnifiedMember;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canCreateCards: boolean;
    canMoveCards: boolean;
  };
}

// ============================================================================
// UNIFIED API RESPONSE TYPES
// ============================================================================

/**
 * Standard API Response Format
 * All API responses should follow this structure
 */
export interface ApiResponse<T = any> {
  status: boolean;
  data: T;
  message: string;
  timestamp: string;
  code: number;
}

// Backend specific response types
export interface BackendApiResponse<T = any> {
  status: boolean;
  data: T;
  message: string;
  timestamp: string;
  code: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UserRegistration {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  profile_image_url?: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  preferences?: UserPreferences;
  statistics?: {
    total_boards: number;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
  };
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    cardUpdates: boolean;
    boardUpdates: boolean;
    memberUpdates: boolean;
  };
  dashboard?: {
    defaultView: 'boards' | 'tasks' | 'calendar';
    showCompletedTasks: boolean;
    showArchivedBoards: boolean;
  };
}

export interface UpdateUserProfileRequest {
  full_name?: string;
  profile_image_url?: string;
  preferences?: UserPreferences;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  };
}

/**
 * Error Response Format
 */
export interface ApiError {
  success: false;
  message: string;
  errors: string[];
  code?: string;
  timestamp: string;
}

// ============================================================================
// UNIFIED BOARD TYPES
// ============================================================================

/**
 * Unified Board Type - Enhanced for backend integration
 */
export interface UnifiedBoard {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number; // User ID
  members: UnifiedBoardMember[];
  settings: {
    allowMemberInvite: boolean;
    allowPublicView: boolean;
    defaultMemberRole: TeamRole;
    cardSettings: {
      allowComments: boolean;
      allowAttachments: boolean;
      allowChecklists: boolean;
    };
  };
  statistics: {
    totalCards: number;
    completedCards: number;
    totalMembers: number;
    lastActivity: string;
  };
}

// ============================================================================
// UNIFIED CARD TYPES
// ============================================================================

/**
 * Unified Card Type - Enhanced for backend integration
 */
export interface UnifiedCard {
  id: number;
  title: string;
  description?: string;
  boardId: number;
  listId: number;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'archived';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number; // User ID
  assignedTo: number[]; // User IDs
  members: UnifiedMember[];
  labels: UnifiedLabel[];
  attachments: UnifiedAttachment[];
  comments: UnifiedComment[];
  checklists: UnifiedChecklist[];
  watchers: number[]; // User IDs
}

/**
 * Unified Label Type
 */
export interface UnifiedLabel {
  id: number;
  name: string;
  color: string;
  boardId: number;
  createdAt: string;
}

/**
 * Unified Attachment Type
 */
export interface UnifiedAttachment {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'other';
  size: number;
  uploadedBy: number; // User ID
  uploadedAt: string;
}

/**
 * Unified Comment Type
 */
export interface UnifiedComment {
  id: number;
  content: string;
  cardId: number;
  authorId: number; // User ID
  author: UnifiedMember;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  mentions: number[]; // User IDs
}

/**
 * Unified Checklist Type
 */
export interface UnifiedChecklist {
  id: number;
  title: string;
  cardId: number;
  items: UnifiedChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Unified Checklist Item Type
 */
export interface UnifiedChecklistItem {
  id: number;
  title: string;
  completed: boolean;
  completedBy?: number; // User ID
  completedAt?: string;
  position: number;
}

// ============================================================================
// UNIFIED NOTIFICATION TYPES
// ============================================================================

/**
 * Unified Notification Type - Enhanced for backend integration
 */
export interface UnifiedNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  userId: number;
  boardId?: number;
  cardId?: number;
  actorId: number;
  actor: UnifiedMember;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

// NotificationType is now an enum above

// ============================================================================
// UNIFIED LIST TYPES
// ============================================================================

/**
 * Unified List Type - Enhanced for backend integration
 */
export interface UnifiedList {
  id: number;
  name: string;
  boardId: number;
  position: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number; // User ID
  cards: UnifiedCard[];
  settings: {
    allowCardCreation: boolean;
    allowCardMovement: boolean;
    maxCards?: number;
  };
}

// ============================================================================
// DATABASE MAPPING TYPES
// ============================================================================

/**
 * Database Entity Types - For backend mapping
 */
export interface DatabaseMember {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  role: string;
  joined_at: string;
  last_active: string;
  boards_count: number;
  tasks_count: number;
  is_active: boolean;
  preferences: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface DatabaseBoard {
  id: number;
  name: string;
  description: string;
  color: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  settings: string; // JSON string
  statistics: string; // JSON string
}

export interface DatabaseBoardMember {
  id: number;
  board_id: number;
  member_id: number;
  role: string;
  joined_at: string;
  permissions: string; // JSON string
}

export interface DatabaseCard {
  id: number;
  title: string;
  description: string;
  board_id: number;
  list_id: number;
  position: number;
  priority: string;
  status: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  assigned_to: string; // JSON array of user IDs
  watchers: string; // JSON array of user IDs
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Helper functions to migrate from old types to new unified types
 */
export const migrateMemberObjType = (oldMember: any): UnifiedMember => ({
  id: oldMember.id,
  name: oldMember.name,
  email: oldMember.email,
  avatar: oldMember.avatar,
  role: oldMember.role || TeamRole.MEMBER,
  joinedAt: oldMember.joinedAt || new Date().toISOString(),
  lastActive: oldMember.lastActive || new Date().toISOString(),
  boards: oldMember.boards || 0,
  tasks: oldMember.tasks || 0,
  isActive: true,
  preferences: {
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    theme: 'light',
    language: 'en',
  },
});

export const migrateTeamMember = (oldMember: any): UnifiedMember => ({
  id: oldMember.id,
  name: oldMember.name,
  email: oldMember.email,
  avatar: oldMember.avatar,
  role: oldMember.role,
  joinedAt: oldMember.joinedAt,
  lastActive: oldMember.lastActive || new Date().toISOString(),
  boards: oldMember.boards || 0,
  tasks: oldMember.tasks || 0,
  isActive: true,
  preferences: {
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    theme: 'light',
    language: 'en',
  },
});

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isUnifiedMember = (obj: any): obj is UnifiedMember => {
  return obj && 
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.role === 'string' &&
    typeof obj.joinedAt === 'string';
};

export const isApiResponse = (obj: any): obj is ApiResponse => {
  return obj && 
    typeof obj.status === 'boolean' &&
    obj.data !== undefined;
};

export const isPaginatedResponse = (obj: any): obj is PaginatedResponse => {
  return isApiResponse(obj) && 
    obj.data &&
    typeof obj.data === 'object' &&
    obj.data !== null &&
    'meta' in obj.data &&
    typeof obj.data.meta === 'object' &&
    obj.data.meta !== null &&
    typeof obj.data.meta.total === 'number' &&
    typeof obj.data.meta.page === 'number';
};
