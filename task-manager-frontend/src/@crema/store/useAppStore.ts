/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  BoardObjType, 
  CardObjType, 
  CardListObjType, 
  MemberObjType,
  // CheckedListObjType 
} from '@crema/types/models/apps/ScrumbBoard';
// import { 
//   UnifiedMember,
//   UnifiedBoard,
//   UnifiedCard,
//   UnifiedList,
//   UnifiedNotification
// } from '@crema/types/models/UnifiedTypes';
import { Notification } from '@crema/mockapi/apis/notifications/NotificationService';

// Store state interface
interface AppState {
  // Boards
  boards: BoardObjType[];
  currentBoard: BoardObjType | null;
  
  // Team
  teamMembers: MemberObjType[];
  boardMembers: Record<number, MemberObjType[]>; // boardId -> members
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBoards: (boards: BoardObjType[]) => void;
  addBoard: (board: BoardObjType) => void;
  updateBoard: (boardId: number, updates: Partial<BoardObjType>) => void;
  deleteBoard: (boardId: number) => void;
  setCurrentBoard: (board: BoardObjType | null) => void;
  
  // Card actions
  addCard: (boardId: number, listId: number, card: CardObjType) => void;
  updateCard: (boardId: number, cardId: number, updates: Partial<CardObjType>) => void;
  deleteCard: (boardId: number, cardId: number) => void;
  moveCard: (boardId: number, cardId: number, fromListId: number, toListId: number, position: number) => void;
  
  // List actions
  addList: (boardId: number, list: CardListObjType) => void;
  updateList: (boardId: number, listId: number, updates: Partial<CardListObjType>) => void;
  deleteList: (boardId: number, listId: number) => void;
  
  // Team actions
  setTeamMembers: (members: MemberObjType[]) => void;
  addTeamMember: (member: MemberObjType) => void;
  updateTeamMember: (memberId: number, updates: Partial<MemberObjType>) => void;
  deleteTeamMember: (memberId: number) => void;
  setBoardMembers: (boardId: number, members: MemberObjType[]) => void;
  addBoardMember: (boardId: number, member: MemberObjType) => void;
  removeBoardMember: (boardId: number, memberId: number) => void;
  
  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: number) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (notificationId: number) => void;
  clearAllNotifications: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, _get) => ({
        // Initial state
        boards: [],
        currentBoard: null,
        teamMembers: [],
        boardMembers: {},
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,

        // Board actions
        setBoards: (boards) => set((state) => {
          state.boards = boards;
        }),

        addBoard: (board) => set((state) => {
          state.boards.push(board);
        }),

        updateBoard: (boardId, updates) => set((state) => {
          const boardIndex = state.boards.findIndex(b => b.id === boardId);
          if (boardIndex !== -1) {
            Object.assign(state.boards[boardIndex], updates);
          }
          if (state.currentBoard?.id === boardId) {
            Object.assign(state.currentBoard, updates);
          }
        }),

        deleteBoard: (boardId) => set((state) => {
          state.boards = state.boards.filter(b => b.id !== boardId);
          if (state.currentBoard?.id === boardId) {
            state.currentBoard = null;
          }
          // Remove board members
          delete state.boardMembers[boardId];
        }),

        setCurrentBoard: (board) => set((state) => {
          state.currentBoard = board;
        }),

        // Card actions
        addCard: (boardId, listId, card) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            const list = board.list.find(l => l.id === listId);
            if (list) {
              list.cards.push(card);
            }
          }
          if (state.currentBoard?.id === boardId) {
            const list = state.currentBoard.list.find(l => l.id === listId);
            if (list) {
              list.cards.push(card);
            }
          }
        }),

        updateCard: (boardId, cardId, updates) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            board.list.forEach(list => {
              const cardIndex = list.cards.findIndex(c => c.id === cardId);
              if (cardIndex !== -1) {
                Object.assign(list.cards[cardIndex], updates);
              }
            });
          }
          if (state.currentBoard?.id === boardId) {
            state.currentBoard.list.forEach(list => {
              const cardIndex = list.cards.findIndex(c => c.id === cardId);
              if (cardIndex !== -1) {
                Object.assign(list.cards[cardIndex], updates);
              }
            });
          }
        }),

        deleteCard: (boardId, cardId) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            board.list.forEach(list => {
              list.cards = list.cards.filter(c => c.id !== cardId);
            });
          }
          if (state.currentBoard?.id === boardId) {
            state.currentBoard.list.forEach(list => {
              list.cards = list.cards.filter(c => c.id !== cardId);
            });
          }
        }),

        moveCard: (boardId, cardId, fromListId, toListId, position) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            const fromList = board.list.find(l => l.id === fromListId);
            const toList = board.list.find(l => l.id === toListId);
            
            if (fromList && toList) {
              const card = fromList.cards.find(c => c.id === cardId);
              if (card) {
                fromList.cards = fromList.cards.filter(c => c.id !== cardId);
                toList.cards.splice(position, 0, card);
              }
            }
          }
          
          // Update current board if it's the same
          if (state.currentBoard?.id === boardId) {
            const fromList = state.currentBoard.list.find(l => l.id === fromListId);
            const toList = state.currentBoard.list.find(l => l.id === toListId);
            
            if (fromList && toList) {
              const card = fromList.cards.find(c => c.id === cardId);
              if (card) {
                fromList.cards = fromList.cards.filter(c => c.id !== cardId);
                toList.cards.splice(position, 0, card);
              }
            }
          }
        }),

        // List actions
        addList: (boardId, list) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            board.list.push(list);
          }
          if (state.currentBoard?.id === boardId) {
            state.currentBoard.list.push(list);
          }
        }),

        updateList: (boardId, listId, updates) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            const listIndex = board.list.findIndex(l => l.id === listId);
            if (listIndex !== -1) {
              Object.assign(board.list[listIndex], updates);
            }
          }
          if (state.currentBoard?.id === boardId) {
            const listIndex = state.currentBoard.list.findIndex(l => l.id === listId);
            if (listIndex !== -1) {
              Object.assign(state.currentBoard.list[listIndex], updates);
            }
          }
        }),

        deleteList: (boardId, listId) => set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            board.list = board.list.filter(l => l.id !== listId);
          }
          if (state.currentBoard?.id === boardId) {
            state.currentBoard.list = state.currentBoard.list.filter(l => l.id !== listId);
          }
        }),

        // Team actions
        setTeamMembers: (members) => set((state) => {
          state.teamMembers = members;
        }),

        addTeamMember: (member) => set((state) => {
          state.teamMembers.push(member);
        }),

        updateTeamMember: (memberId, updates) => set((state) => {
          const memberIndex = state.teamMembers.findIndex(m => m.id === memberId);
          if (memberIndex !== -1) {
            Object.assign(state.teamMembers[memberIndex], updates);
          }
        }),

        deleteTeamMember: (memberId) => set((state) => {
          state.teamMembers = state.teamMembers.filter(m => m.id !== memberId);
          // Remove from all boards
          Object.keys(state.boardMembers).forEach(boardId => {
            state.boardMembers[Number(boardId)] = state.boardMembers[Number(boardId)].filter(m => m.id !== memberId);
          });
        }),

        setBoardMembers: (boardId, members) => set((state) => {
          state.boardMembers[boardId] = members;
        }),

        addBoardMember: (boardId, member) => set((state) => {
          if (!state.boardMembers[boardId]) {
            state.boardMembers[boardId] = [];
          }
          state.boardMembers[boardId].push(member);
        }),

        removeBoardMember: (boardId, memberId) => set((state) => {
          if (state.boardMembers[boardId]) {
            state.boardMembers[boardId] = state.boardMembers[boardId].filter(m => m.id !== memberId);
          }
        }),

        // Notification actions
        setNotifications: (notifications) => set((state) => {
          state.notifications = notifications;
          state.unreadCount = notifications.filter(n => !n.isRead).length;
        }),

        addNotification: (notification) => set((state) => {
          state.notifications.unshift(notification);
          if (!notification.isRead) {
            state.unreadCount += 1;
          }
        }),

        markNotificationAsRead: (notificationId) => set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            notification.isRead = true;
            state.unreadCount -= 1;
          }
        }),

        markAllNotificationsAsRead: () => set((state) => {
          state.notifications.forEach(n => n.isRead = true);
          state.unreadCount = 0;
        }),

        deleteNotification: (notificationId) => set((state) => {
          const notification = state.notifications.find(n => n.id === notificationId);
          if (notification && !notification.isRead) {
            state.unreadCount -= 1;
          }
          state.notifications = state.notifications.filter(n => n.id !== notificationId);
        }),

        clearAllNotifications: () => set((state) => {
          state.notifications = [];
          state.unreadCount = 0;
        }),

        // UI actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),

        setError: (error) => set((state) => {
          state.error = error;
        }),

        clearError: () => set((state) => {
          state.error = null;
        }),
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          boards: state.boards,
          teamMembers: state.teamMembers,
          boardMembers: state.boardMembers,
          notifications: state.notifications,
          unreadCount: state.unreadCount,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// Selector hooks for better performance
export const useBoards = () => useAppStore((state) => state.boards);
export const useCurrentBoard = () => useAppStore((state) => state.currentBoard);
export const useTeamMembers = () => useAppStore((state) => state.teamMembers);
export const useBoardMembers = (boardId: number) => {
  const boardMembers = useAppStore((state) => state.boardMembers[boardId]);
  return boardMembers || [];
};
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useUnreadCount = () => useAppStore((state) => state.unreadCount);
export const useAppLoading = () => useAppStore((state) => state.isLoading);
export const useAppError = () => useAppStore((state) => state.error);
