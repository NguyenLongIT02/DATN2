/**
 * UNIFIED ZUSTAND STORE - Centralized state management for backend integration
 * This store replaces all individual context providers and provides a single source of truth
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  UnifiedMember,
  UnifiedBoard,
  UnifiedCard,
  UnifiedList,
  UnifiedNotification,
  UnifiedBoardMember
} from '@crema/types/models/UnifiedTypes';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface UnifiedState {
  // ============================================================================
  // AUTHENTICATION STATE
  // ============================================================================
  auth: {
    user: UnifiedMember | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    token: string | null;
  };

  // ============================================================================
  // BOARDS STATE
  // ============================================================================
  boards: {
    items: UnifiedBoard[];
    currentBoard: UnifiedBoard | null;
    isLoading: boolean;
    error: string | null;
  };

  // ============================================================================
  // TEAM STATE
  // ============================================================================
  team: {
    members: UnifiedMember[];
    boardMembers: Record<number, UnifiedBoardMember[]>; // boardId -> members
    isLoading: boolean;
    error: string | null;
  };

  // ============================================================================
  // NOTIFICATIONS STATE
  // ============================================================================
  notifications: {
    items: UnifiedNotification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
  };

  // ============================================================================
  // UI STATE
  // ============================================================================
  ui: {
    isLoading: boolean;
    error: string | null;
    theme: 'light' | 'dark';
    language: string;
  };

  // ============================================================================
  // WEBSOCKET STATE
  // ============================================================================
  websocket: {
    isConnected: boolean;
    activeUsers: Record<number, UnifiedMember[]>; // boardId -> active users
    typingUsers: Record<string, UnifiedMember[]>; // cardId -> typing users
    cursorPositions: Record<string, { x: number; y: number; user: UnifiedMember }>; // userId -> position
  };
}

// ============================================================================
// STORE ACTIONS INTERFACE
// ============================================================================

interface UnifiedActions {
  // ============================================================================
  // AUTH ACTIONS
  // ============================================================================
  setAuthUser: (user: UnifiedMember | null, token?: string) => void;
  clearAuth: () => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;

  // ============================================================================
  // BOARD ACTIONS
  // ============================================================================
  setBoards: (boards: UnifiedBoard[]) => void;
  addBoard: (board: UnifiedBoard) => void;
  updateBoard: (boardId: number, updates: Partial<UnifiedBoard>) => void;
  deleteBoard: (boardId: number) => void;
  setCurrentBoard: (board: UnifiedBoard | null) => void;
  setBoardsLoading: (loading: boolean) => void;
  setBoardsError: (error: string | null) => void;

  // ============================================================================
  // CARD ACTIONS
  // ============================================================================
  addCard: (boardId: number, listId: number, card: UnifiedCard) => void;
  updateCard: (boardId: number, cardId: number, updates: Partial<UnifiedCard>) => void;
  deleteCard: (boardId: number, cardId: number) => void;
  moveCard: (boardId: number, cardId: number, fromListId: number, toListId: number, position: number) => void;

  // ============================================================================
  // LIST ACTIONS
  // ============================================================================
  addList: (boardId: number, list: UnifiedList) => void;
  updateList: (boardId: number, listId: number, updates: Partial<UnifiedList>) => void;
  deleteList: (boardId: number, listId: number) => void;

  // ============================================================================
  // TEAM ACTIONS
  // ============================================================================
  setTeamMembers: (members: UnifiedMember[]) => void;
  addTeamMember: (member: UnifiedMember) => void;
  updateTeamMember: (memberId: number, updates: Partial<UnifiedMember>) => void;
  deleteTeamMember: (memberId: number) => void;
  setBoardMembers: (boardId: number, members: UnifiedBoardMember[]) => void;
  addBoardMember: (boardId: number, member: UnifiedBoardMember) => void;
  updateBoardMember: (boardId: number, memberId: number, updates: Partial<UnifiedBoardMember>) => void;
  removeBoardMember: (boardId: number, memberId: number) => void;
  setTeamLoading: (loading: boolean) => void;
  setTeamError: (error: string | null) => void;

  // ============================================================================
  // NOTIFICATION ACTIONS
  // ============================================================================
  setNotifications: (notifications: UnifiedNotification[]) => void;
  addNotification: (notification: UnifiedNotification) => void;
  markNotificationAsRead: (notificationId: number) => void;
  markAllNotificationsAsRead: (userId: number) => void;
  deleteNotification: (notificationId: number) => void;
  clearAllNotifications: () => void;
  setNotificationsLoading: (loading: boolean) => void;
  setNotificationsError: (error: string | null) => void;

  // ============================================================================
  // UI ACTIONS
  // ============================================================================
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;

  // ============================================================================
  // WEBSOCKET ACTIONS
  // ============================================================================
  setWebSocketConnected: (connected: boolean) => void;
  setActiveUsers: (boardId: number, users: UnifiedMember[]) => void;
  addActiveUser: (boardId: number, user: UnifiedMember) => void;
  removeActiveUser: (boardId: number, userId: number) => void;
  setTypingUsers: (cardId: string, users: UnifiedMember[]) => void;
  addTypingUser: (cardId: string, user: UnifiedMember) => void;
  removeTypingUser: (cardId: string, userId: number) => void;
  setCursorPosition: (userId: number, position: { x: number; y: number; user: UnifiedMember }) => void;
  removeCursorPosition: (userId: number) => void;
}

// ============================================================================
// COMBINED STORE TYPE
// ============================================================================

type UnifiedStore = UnifiedState & UnifiedActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UnifiedState = {
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
  },
  boards: {
    items: [],
    currentBoard: null,
    isLoading: false,
    error: null,
  },
  team: {
    members: [],
    boardMembers: {},
    isLoading: false,
    error: null,
  },
  notifications: {
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  ui: {
    isLoading: false,
    error: null,
    theme: 'light',
    language: 'en',
  },
  websocket: {
    isConnected: false,
    activeUsers: {},
    typingUsers: {},
    cursorPositions: {},
  },
};

// ============================================================================
// ZUSTAND STORE CREATION
// ============================================================================

export const useUnifiedStore = create<UnifiedStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // ============================================================================
        // AUTH ACTIONS
        // ============================================================================
        setAuthUser: (user, token) => set((state) => {
          state.auth.user = user;
          state.auth.isAuthenticated = !!user;
          state.auth.token = token || null;
        }),

        clearAuth: () => set((state) => {
          state.auth.user = null;
          state.auth.isAuthenticated = false;
          state.auth.token = null;
        }),

        setAuthLoading: (loading) => set((state) => {
          state.auth.isLoading = loading;
        }),

        setAuthError: (error) => set((state) => {
          // Auth error is handled by UI state
          state.ui.error = error;
        }),

        // ============================================================================
        // BOARD ACTIONS
        // ============================================================================
        setBoards: (boards) => set((state) => {
          state.boards.items = boards;
        }),

        addBoard: (board) => set((state) => {
          state.boards.items.push(board);
        }),

        updateBoard: (boardId, updates) => set((state) => {
          const index = state.boards.items.findIndex(b => b.id === boardId);
          if (index !== -1) {
            Object.assign(state.boards.items[index], updates);
          }
          if (state.boards.currentBoard?.id === boardId) {
            Object.assign(state.boards.currentBoard, updates);
          }
        }),

        deleteBoard: (boardId) => set((state) => {
          state.boards.items = state.boards.items.filter(b => b.id !== boardId);
          if (state.boards.currentBoard?.id === boardId) {
            state.boards.currentBoard = null;
          }
        }),

        setCurrentBoard: (board) => set((state) => {
          state.boards.currentBoard = board;
        }),

        setBoardsLoading: (loading) => set((state) => {
          state.boards.isLoading = loading;
        }),

        setBoardsError: (error) => set((state) => {
          state.boards.error = error;
        }),

        // ============================================================================
        // CARD ACTIONS
        // ============================================================================
        addCard: (boardId, listId, card) => set(() => {
          // TODO: Implement card addition logic based on actual board structure
          console.log('Adding card:', card, 'to board:', boardId, 'list:', listId);
        }),

        updateCard: (boardId, cardId, updates) => set(() => {
          // TODO: Implement card update logic based on actual board structure
          console.log('Updating card:', cardId, 'in board:', boardId, 'with updates:', updates);
        }),

        deleteCard: (boardId, cardId) => set(() => {
          // TODO: Implement card deletion logic based on actual board structure
          console.log('Deleting card:', cardId, 'from board:', boardId);
        }),

        moveCard: (_boardId, cardId, fromListId, toListId, position) => set(() => {
          // TODO: Implement card move logic based on actual board structure
          console.log('Moving card:', cardId, 'from list:', fromListId, 'to list:', toListId, 'at position:', position);
        }),

        // ============================================================================
        // LIST ACTIONS
        // ============================================================================
        addList: (boardId, list) => set(() => {
          // TODO: Implement list addition logic based on actual board structure
          console.log('Adding list:', list, 'to board:', boardId);
        }),

        updateList: (boardId, listId, updates) => set(() => {
          // TODO: Implement list update logic based on actual board structure
          console.log('Updating list:', listId, 'in board:', boardId, 'with updates:', updates);
        }),

        deleteList: (boardId, listId) => set(() => {
          // TODO: Implement list deletion logic based on actual board structure
          console.log('Deleting list:', listId, 'from board:', boardId);
        }),

        // ============================================================================
        // TEAM ACTIONS
        // ============================================================================
        setTeamMembers: (members) => set((state) => {
          state.team.members = members;
        }),

        addTeamMember: (member) => set((state) => {
          state.team.members.push(member);
        }),

        updateTeamMember: (memberId, updates) => set((state) => {
          const index = state.team.members.findIndex(m => m.id === memberId);
          if (index !== -1) {
            Object.assign(state.team.members[index], updates);
          }
        }),

        deleteTeamMember: (memberId) => set((state) => {
          state.team.members = state.team.members.filter(m => m.id !== memberId);
        }),

        setBoardMembers: (boardId, members) => set((state) => {
          state.team.boardMembers[boardId] = members;
        }),

        addBoardMember: (boardId, member) => set((state) => {
          if (!state.team.boardMembers[boardId]) {
            state.team.boardMembers[boardId] = [];
          }
          state.team.boardMembers[boardId].push(member);
        }),

        updateBoardMember: (boardId, memberId, updates) => set((state) => {
          const members = state.team.boardMembers[boardId];
          if (members) {
            const index = members.findIndex(m => m.memberId === memberId);
            if (index !== -1) {
              Object.assign(members[index], updates);
            }
          }
        }),

        removeBoardMember: (boardId, memberId) => set((state) => {
          const members = state.team.boardMembers[boardId];
          if (members) {
            state.team.boardMembers[boardId] = members.filter(m => m.memberId !== memberId);
          }
        }),

        setTeamLoading: (loading) => set((state) => {
          state.team.isLoading = loading;
        }),

        setTeamError: (error) => set((state) => {
          state.team.error = error;
        }),

        // ============================================================================
        // NOTIFICATION ACTIONS
        // ============================================================================
        setNotifications: (notifications) => set((state) => {
          state.notifications.items = notifications;
          state.notifications.unreadCount = notifications.filter(n => !n.isRead).length;
        }),

        addNotification: (notification) => set((state) => {
          state.notifications.items.unshift(notification);
          if (!notification.isRead) {
            state.notifications.unreadCount++;
          }
        }),

        markNotificationAsRead: (notificationId) => set((state) => {
          const notification = state.notifications.items.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            state.notifications.unreadCount--;
          }
        }),

        markAllNotificationsAsRead: (userId) => set((state) => {
          state.notifications.items.forEach(notification => {
            if (notification.userId === userId && !notification.isRead) {
              notification.isRead = true;
            }
          });
          state.notifications.unreadCount = 0;
        }),

        deleteNotification: (notificationId) => set((state) => {
          const notification = state.notifications.items.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            state.notifications.unreadCount--;
          }
          state.notifications.items = state.notifications.items.filter(n => n.id !== notificationId);
        }),

        clearAllNotifications: () => set((state) => {
          state.notifications.items = [];
          state.notifications.unreadCount = 0;
        }),

        setNotificationsLoading: (loading) => set((state) => {
          state.notifications.isLoading = loading;
        }),

        setNotificationsError: (error) => set((state) => {
          state.notifications.error = error;
        }),

        // ============================================================================
        // UI ACTIONS
        // ============================================================================
        setLoading: (loading) => set((state) => {
          state.ui.isLoading = loading;
        }),

        setError: (error) => set((state) => {
          state.ui.error = error;
        }),

        clearError: () => set((state) => {
          state.ui.error = null;
        }),

        setTheme: (theme) => set((state) => {
          state.ui.theme = theme;
        }),

        setLanguage: (language) => set((state) => {
          state.ui.language = language;
        }),

        // ============================================================================
        // WEBSOCKET ACTIONS
        // ============================================================================
        setWebSocketConnected: (connected) => set((state) => {
          state.websocket.isConnected = connected;
        }),

        setActiveUsers: (boardId, users) => set((state) => {
          state.websocket.activeUsers[boardId] = users;
        }),

        addActiveUser: (boardId, user) => set((state) => {
          if (!state.websocket.activeUsers[boardId]) {
            state.websocket.activeUsers[boardId] = [];
          }
          const exists = state.websocket.activeUsers[boardId].find(u => u.id === user.id);
          if (!exists) {
            state.websocket.activeUsers[boardId].push(user);
          }
        }),

        removeActiveUser: (boardId, userId) => set((state) => {
          const users = state.websocket.activeUsers[boardId];
          if (users) {
            state.websocket.activeUsers[boardId] = users.filter(u => u.id !== userId);
          }
        }),

        setTypingUsers: (cardId, users) => set((state) => {
          state.websocket.typingUsers[cardId] = users;
        }),

        addTypingUser: (cardId, user) => set((state) => {
          if (!state.websocket.typingUsers[cardId]) {
            state.websocket.typingUsers[cardId] = [];
          }
          const exists = state.websocket.typingUsers[cardId].find(u => u.id === user.id);
          if (!exists) {
            state.websocket.typingUsers[cardId].push(user);
          }
        }),

        removeTypingUser: (cardId, userId) => set((state) => {
          const users = state.websocket.typingUsers[cardId];
          if (users) {
            state.websocket.typingUsers[cardId] = users.filter(u => u.id !== userId);
          }
        }),

        setCursorPosition: (userId, position) => set((state) => {
          state.websocket.cursorPositions[userId] = position;
        }),

        removeCursorPosition: (userId) => set((state) => {
          delete state.websocket.cursorPositions[userId];
        }),
      })),
      {
        name: 'unified-store',
        partialize: (state) => ({
          auth: {
            user: state.auth.user,
            isAuthenticated: state.auth.isAuthenticated,
            token: state.auth.token,
          },
          ui: {
            theme: state.ui.theme,
            language: state.ui.language,
          },
        }),
      }
    ),
    {
      name: 'unified-store',
    }
  )
);

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

export const useAuth = () => useUnifiedStore((state) => state.auth);
export const useBoards = () => useUnifiedStore((state) => state.boards);
export const useTeam = () => useUnifiedStore((state) => state.team);
export const useNotifications = () => useUnifiedStore((state) => state.notifications);
export const useUI = () => useUnifiedStore((state) => state.ui);
export const useWebSocket = () => useUnifiedStore((state) => state.websocket);

// ============================================================================
// ACTION HOOKS
// ============================================================================

export const useAuthActions = () => useUnifiedStore((state) => ({
  setAuthUser: state.setAuthUser,
  clearAuth: state.clearAuth,
  setAuthLoading: state.setAuthLoading,
  setAuthError: state.setAuthError,
}));

export const useBoardActions = () => useUnifiedStore((state) => ({
  setBoards: state.setBoards,
  addBoard: state.addBoard,
  updateBoard: state.updateBoard,
  deleteBoard: state.deleteBoard,
  setCurrentBoard: state.setCurrentBoard,
  setBoardsLoading: state.setBoardsLoading,
  setBoardsError: state.setBoardsError,
}));

export const useCardActions = () => useUnifiedStore((state) => ({
  addCard: state.addCard,
  updateCard: state.updateCard,
  deleteCard: state.deleteCard,
  moveCard: state.moveCard,
}));

export const useListActions = () => useUnifiedStore((state) => ({
  addList: state.addList,
  updateList: state.updateList,
  deleteList: state.deleteList,
}));

export const useTeamActions = () => useUnifiedStore((state) => ({
  setTeamMembers: state.setTeamMembers,
  addTeamMember: state.addTeamMember,
  updateTeamMember: state.updateTeamMember,
  deleteTeamMember: state.deleteTeamMember,
  setBoardMembers: state.setBoardMembers,
  addBoardMember: state.addBoardMember,
  updateBoardMember: state.updateBoardMember,
  removeBoardMember: state.removeBoardMember,
  setTeamLoading: state.setTeamLoading,
  setTeamError: state.setTeamError,
}));

export const useNotificationActions = () => useUnifiedStore((state) => ({
  setNotifications: state.setNotifications,
  addNotification: state.addNotification,
  markNotificationAsRead: state.markNotificationAsRead,
  markAllNotificationsAsRead: state.markAllNotificationsAsRead,
  deleteNotification: state.deleteNotification,
  clearAllNotifications: state.clearAllNotifications,
  setNotificationsLoading: state.setNotificationsLoading,
  setNotificationsError: state.setNotificationsError,
}));

export const useUIActions = () => useUnifiedStore((state) => ({
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  setTheme: state.setTheme,
  setLanguage: state.setLanguage,
}));

export const useWebSocketActions = () => useUnifiedStore((state) => ({
  setWebSocketConnected: state.setWebSocketConnected,
  setActiveUsers: state.setActiveUsers,
  addActiveUser: state.addActiveUser,
  removeActiveUser: state.removeActiveUser,
  setTypingUsers: state.setTypingUsers,
  addTypingUser: state.addTypingUser,
  removeTypingUser: state.removeTypingUser,
  setCursorPosition: state.setCursorPosition,
  removeCursorPosition: state.removeCursorPosition,
}));
