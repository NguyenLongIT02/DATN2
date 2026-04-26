/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Migration Utilities - Helper functions to migrate from old types to new unified types
 * This file provides backward compatibility during the transition period
 */

import { 
  UnifiedMember,
  UnifiedBoard,
  UnifiedCard,
  UnifiedList,
  UnifiedNotification,
  migrateMemberObjType,
  migrateTeamMember
} from '@crema/types/models/UnifiedTypes';
import { 
  BoardObjType, 
  CardObjType, 
  CardListObjType, 
  MemberObjType 
} from '@crema/types/models/apps/ScrumbBoard';
import { TeamMember, BoardMember } from '@crema/services/PermissionService';
import { Notification } from '@crema/mockapi/apis/notifications/NotificationService';

// ============================================================================
// MEMBER MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate MemberObjType to UnifiedMember
 */
export const migrateMemberObjTypeToUnified = (oldMember: MemberObjType): UnifiedMember => {
  return migrateMemberObjType(oldMember);
};

/**
 * Migrate TeamMember to UnifiedMember
 */
export const migrateTeamMemberToUnified = (oldMember: TeamMember): UnifiedMember => {
  return migrateTeamMember(oldMember);
};

/**
 * Migrate array of MemberObjType to UnifiedMember[]
 */
export const migrateMemberObjTypeArray = (oldMembers: MemberObjType[]): UnifiedMember[] => {
  return oldMembers.map(migrateMemberObjTypeToUnified);
};

/**
 * Migrate array of TeamMember to UnifiedMember[]
 */
export const migrateTeamMemberArray = (oldMembers: TeamMember[]): UnifiedMember[] => {
  return oldMembers.map(migrateTeamMemberToUnified);
};

/**
 * Migrate BoardMember to UnifiedBoardMember
 */
export const migrateBoardMemberToUnified = (oldBoardMember: BoardMember): any => {
  return {
    id: oldBoardMember.id,
    memberId: oldBoardMember.memberId,
    boardId: oldBoardMember.boardId,
    role: oldBoardMember.role,
    joinedAt: oldBoardMember.joinedAt,
    member: migrateTeamMemberToUnified(oldBoardMember.member),
    permissions: {
      canEdit: oldBoardMember.role === 'team_lead' || oldBoardMember.role === 'pm',
      canDelete: oldBoardMember.role === 'pm',
      canManageMembers: oldBoardMember.role === 'team_lead' || oldBoardMember.role === 'pm',
    },
  };
};

// ============================================================================
// BOARD MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate BoardObjType to UnifiedBoard
 */
export const migrateBoardObjTypeToUnified = (oldBoard: BoardObjType): UnifiedBoard => {
  return {
    id: oldBoard.id,
    name: oldBoard.name,
    description: oldBoard.description || '',
    color: oldBoard.color || '#1976d2',
    isPublic: false, // Default value, can be enhanced later
    createdAt: new Date().toISOString(), // Default value
    updatedAt: new Date().toISOString(), // Default value
    createdBy: 1, // Default value, should be set from context
    members: oldBoard.members?.map(migrateMemberObjTypeToUnified).map((member: any, index: number) => ({
      id: index + 1,
      memberId: member.id,
      boardId: oldBoard.id,
      role: member.role as any,
      joinedAt: member.joinedAt,
      member,
      permissions: {
        canEdit: member.role === 'team_lead' || member.role === 'pm',
        canDelete: member.role === 'pm',
        canManageMembers: member.role === 'team_lead' || member.role === 'pm',
        canCreateCards: true,
        canMoveCards: true,
      },
    })) || [],
    settings: {
      allowMemberInvite: true,
      allowPublicView: false,
      defaultMemberRole: 'member' as any,
      cardSettings: {
        allowComments: true,
        allowAttachments: true,
        allowChecklists: true,
      },
    },
    statistics: {
      totalCards: oldBoard.list?.reduce((total, list) => total + (list.cards?.length || 0), 0) || 0,
      completedCards: 0, // Can be calculated from card status
      totalMembers: oldBoard.members?.length || 0,
      lastActivity: new Date().toISOString(),
    },
  };
};

/**
 * Migrate array of BoardObjType to UnifiedBoard[]
 */
export const migrateBoardObjTypeArray = (oldBoards: BoardObjType[]): UnifiedBoard[] => {
  return oldBoards.map(migrateBoardObjTypeToUnified);
};

// ============================================================================
// CARD MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate CardObjType to UnifiedCard
 */
export const migrateCardObjTypeToUnified = (oldCard: CardObjType, boardId: number, listId: number): UnifiedCard => {
  return {
    id: oldCard.id,
    title: oldCard.title,
    description: oldCard.desc || '',
    boardId,
    listId,
    position: 0, // Default value, should be set from context
    priority: 'medium' as any, // Default value
    status: 'todo' as any, // Default value
    dueDate: oldCard.date?.dueDate || undefined,
    createdAt: new Date().toISOString(), // Default value
    updatedAt: new Date().toISOString(), // Default value
    createdBy: 1, // Default value, should be set from context
    assignedTo: oldCard.members?.map(m => m.id) || [],
    members: oldCard.members?.map(migrateMemberObjTypeToUnified) || [],
    labels: oldCard.label?.map((label, index) => ({
      id: index + 1,
      name: label.name,
      color: label.color,
      boardId,
      createdAt: new Date().toISOString(),
    })) || [],
    attachments: oldCard.attachments?.map((attachment, index) => ({
      id: index + 1,
      name: attachment.file.name,
      url: attachment.preview,
      type: 'other' as any, // Default value
      size: attachment.file.size || 0,
      uploadedBy: 1, // Default value
      uploadedAt: new Date().toISOString(),
    })) || [],
    comments: oldCard.comments?.map((comment, index) => ({
      id: index + 1,
      content: comment.comment || '',
      cardId: oldCard.id,
      authorId: 1, // Default value
      author: migrateMemberObjTypeToUnified({
        id: 1,
        name: comment.name || 'Unknown',
        email: 'unknown@example.com',
        avatar: comment.image || '',
      }),
      createdAt: comment.date || new Date().toISOString(),
      updatedAt: comment.date || new Date().toISOString(),
      isEdited: false,
      mentions: [],
    })) || [],
    checklists: oldCard.checkedList?.map((checklist, index) => ({
      id: index + 1,
      title: 'Checklist', // Default title
      cardId: oldCard.id,
      items: [{
        id: index + 1,
        title: checklist.title,
        completed: checklist.checked || false,
        completedBy: checklist.checked ? 1 : undefined,
        completedAt: checklist.checked ? new Date().toISOString() : undefined,
        position: index,
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })) || [],
    watchers: oldCard.members?.map(m => m.id) || [],
  };
};

/**
 * Migrate array of CardObjType to UnifiedCard[]
 */
export const migrateCardObjTypeArray = (oldCards: CardObjType[], boardId: number, listId: number): UnifiedCard[] => {
  return oldCards.map(card => migrateCardObjTypeToUnified(card, boardId, listId));
};

// ============================================================================
// LIST MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate CardListObjType to UnifiedList
 */
export const migrateCardListObjTypeToUnified = (oldList: CardListObjType, boardId: number): UnifiedList => {
  return {
    id: oldList.id,
    name: oldList.name,
    boardId,
    position: 0, // Default value, should be set from context
    isArchived: false,
    createdAt: new Date().toISOString(), // Default value
    updatedAt: new Date().toISOString(), // Default value
    createdBy: 1, // Default value, should be set from context
    cards: migrateCardObjTypeArray(oldList.cards || [], boardId, oldList.id),
    settings: {
      allowCardCreation: true,
      allowCardMovement: true,
    },
  };
};

/**
 * Migrate array of CardListObjType to UnifiedList[]
 */
export const migrateCardListObjTypeArray = (oldLists: CardListObjType[], boardId: number): UnifiedList[] => {
  return oldLists.map(list => migrateCardListObjTypeToUnified(list, boardId));
};

// ============================================================================
// NOTIFICATION MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate Notification to UnifiedNotification
 */
export const migrateNotificationToUnified = (oldNotification: Notification): UnifiedNotification => {
  return {
    id: oldNotification.id,
    type: oldNotification.type as any,
    title: oldNotification.title,
    message: oldNotification.message,
    userId: oldNotification.userId,
    boardId: oldNotification.boardId,
    cardId: oldNotification.cardId,
    actorId: oldNotification.actorId || 1,
    actor: {
      id: oldNotification.actorId || 1,
      name: oldNotification.actorName || 'Unknown',
      email: 'unknown@example.com',
      avatar: oldNotification.actorAvatar || '',
      role: 'member' as any,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      boards: 0,
      tasks: 0,
      isActive: true,
    },
    isRead: oldNotification.isRead || false,
    createdAt: oldNotification.createdAt || new Date().toISOString(),
    readAt: (oldNotification as any).readAt,
    metadata: oldNotification.metadata || {},
  };
};

/**
 * Migrate array of Notification to UnifiedNotification[]
 */
export const migrateNotificationArray = (oldNotifications: Notification[]): UnifiedNotification[] => {
  return oldNotifications.map(migrateNotificationToUnified);
};

// ============================================================================
// BATCH MIGRATION UTILITIES
// ============================================================================

/**
 * Migrate entire board data structure from old format to new unified format
 */
export const migrateBoardData = (oldBoard: BoardObjType): {
  board: UnifiedBoard;
  lists: UnifiedList[];
  cards: UnifiedCard[];
  members: UnifiedMember[];
} => {
  const board = migrateBoardObjTypeToUnified(oldBoard);
  const lists = migrateCardListObjTypeArray(oldBoard.list || [], oldBoard.id);
  const cards = lists.flatMap(list => list.cards);
  const members = board.members.map(bm => bm.member);

  return {
    board,
    lists,
    cards,
    members,
  };
};

/**
 * Migrate entire project data from old format to new unified format
 */
export const migrateProjectData = (oldBoards: BoardObjType[]): {
  boards: UnifiedBoard[];
  lists: UnifiedList[];
  cards: UnifiedCard[];
  members: UnifiedMember[];
} => {
  const boards = migrateBoardObjTypeArray(oldBoards);
  const lists = boards.flatMap(board => 
    migrateCardListObjTypeArray(oldBoards.find(b => b.id === board.id)?.list || [], board.id)
  );
  const cards = lists.flatMap(list => list.cards);
  const members = boards.flatMap(board => board.members.map(bm => bm.member));

  // Remove duplicate members
  const uniqueMembers = members.filter((member, index, self) => 
    index === self.findIndex(m => m.id === member.id)
  );

  return {
    boards,
    lists,
    cards,
    members: uniqueMembers,
  };
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate if old data can be migrated
 */
export const validateMigrationData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Data is null or undefined');
    return { isValid: false, errors };
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item at index ${index} is missing required 'id' field`);
      }
    });
  } else {
    if (!data.id) {
      errors.push('Data is missing required "id" field');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Safe migration with error handling
 */
export const safeMigrate = <T, R>(
  data: T,
  migrationFn: (data: T) => R,
  fallbackFn?: (data: T) => R
): R | null => {
  try {
    const validation = validateMigrationData(data);
    if (!validation.isValid) {
      console.warn('Migration validation failed:', validation.errors);
      if (fallbackFn) {
        return fallbackFn(data);
      }
      return null;
    }
    return migrationFn(data);
  } catch (error) {
    console.error('Migration failed:', error);
    if (fallbackFn) {
      return fallbackFn(data);
    }
    return null;
  }
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const MigrationUtils = {
  // Member migrations
  migrateMemberObjTypeToUnified,
  migrateTeamMemberToUnified,
  migrateMemberObjTypeArray,
  migrateTeamMemberArray,
  migrateBoardMemberToUnified,

  // Board migrations
  migrateBoardObjTypeToUnified,
  migrateBoardObjTypeArray,

  // Card migrations
  migrateCardObjTypeToUnified,
  migrateCardObjTypeArray,

  // List migrations
  migrateCardListObjTypeToUnified,
  migrateCardListObjTypeArray,

  // Notification migrations
  migrateNotificationToUnified,
  migrateNotificationArray,

  // Batch migrations
  migrateBoardData,
  migrateProjectData,

  // Validation
  validateMigrationData,
  safeMigrate,
};

export default MigrationUtils;
