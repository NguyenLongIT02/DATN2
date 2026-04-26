/**
 * UNIFIED API SERVICE - Standardized API calls for backend integration
 * This service provides consistent API patterns and response handling
 */

import { jwtAxios } from '@crema/services/auth/jwt-auth';
import { 
  ApiResponse, 
  UnifiedMember,
  UnifiedBoard,
  UnifiedCard,
  UnifiedList,
  UnifiedNotification,
  UnifiedBoardMember,
  TeamRole
} from '@crema/types/models/UnifiedTypes';

// ============================================================================
// API CONFIGURATION
// ============================================================================

// API_TIMEOUT is configured in jwtAxios

// ============================================================================
// API ENDPOINTS
// ============================================================================

const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh-token',
    ME: '/api/v1/auth/me',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  
  // Users/Members
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    SEARCH: '/users/search',
  },
  
  // Boards
  BOARDS: {
    LIST: '/boards',
    CREATE: '/boards',
    GET: (id: number) => `/boards/${id}`,
    UPDATE: (id: number) => `/boards/${id}`,
    DELETE: (id: number) => `/boards/${id}`,
    MEMBERS: (id: number) => `/boards/${id}/members`,
    ADD_MEMBER: (id: number) => `/boards/${id}/members`,
    REMOVE_MEMBER: (boardId: number, memberId: number) => `/boards/${boardId}/members/${memberId}`,
    UPDATE_MEMBER_ROLE: (boardId: number, memberId: number) => `/boards/${boardId}/members/${memberId}/role`,
  },
  
  // Lists
  LISTS: {
    LIST: (boardId: number) => `/boards/${boardId}/lists`,
    CREATE: (boardId: number) => `/boards/${boardId}/lists`,
    GET: (boardId: number, id: number) => `/boards/${boardId}/lists/${id}`,
    UPDATE: (boardId: number, id: number) => `/boards/${boardId}/lists/${id}`,
    DELETE: (boardId: number, id: number) => `/boards/${boardId}/lists/${id}`,
    REORDER: (boardId: number) => `/boards/${boardId}/lists/reorder`,
  },
  
  // Cards
  CARDS: {
    LIST: (boardId: number, listId: number) => `/boards/${boardId}/lists/${listId}/cards`,
    CREATE: (boardId: number, listId: number) => `/boards/${boardId}/lists/${listId}/cards`,
    GET: (boardId: number, listId: number, id: number) => `/boards/${boardId}/lists/${listId}/cards/${id}`,
    UPDATE: (boardId: number, listId: number, id: number) => `/boards/${boardId}/lists/${listId}/cards/${id}`,
    DELETE: (boardId: number, listId: number, id: number) => `/boards/${boardId}/lists/${listId}/cards/${id}`,
    MOVE: (boardId: number, id: number) => `/boards/${boardId}/cards/${id}/move`,
    ASSIGN: (boardId: number, id: number) => `/boards/${boardId}/cards/${id}/assign`,
    UNASSIGN: (boardId: number, id: number) => `/boards/${boardId}/cards/${id}/unassign`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    GET: (id: number) => `/notifications/${id}`,
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: number) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications/clear-all',
  },
  
  // Labels
  LABELS: {
    LIST: (boardId: number) => `/boards/${boardId}/labels`,
    CREATE: (boardId: number) => `/boards/${boardId}/labels`,
    UPDATE: (boardId: number, id: number) => `/boards/${boardId}/labels/${id}`,
    DELETE: (boardId: number, id: number) => `/boards/${boardId}/labels/${id}`,
  },
  
  // Comments
  COMMENTS: {
    LIST: (boardId: number, cardId: number) => `/boards/${boardId}/cards/${cardId}/comments`,
    CREATE: (boardId: number, cardId: number) => `/boards/${boardId}/cards/${cardId}/comments`,
    UPDATE: (boardId: number, cardId: number, id: number) => `/boards/${boardId}/cards/${cardId}/comments/${id}`,
    DELETE: (boardId: number, cardId: number, id: number) => `/boards/${boardId}/cards/${cardId}/comments/${id}`,
  },
  
  // Attachments
  ATTACHMENTS: {
    LIST: (boardId: number, cardId: number) => `/boards/${boardId}/cards/${cardId}/attachments`,
    UPLOAD: (boardId: number, cardId: number) => `/boards/${boardId}/cards/${cardId}/attachments`,
    DELETE: (boardId: number, cardId: number, id: number) => `/boards/${boardId}/cards/${cardId}/attachments/${id}`,
  },
  
  // Checklists
  CHECKLISTS: {
    LIST: (boardId: number, cardId: number) => `/boards/${boardId}/cards/${cardId}/checklists`,
    CREATE: (boardId: number, cardId: number) => `/boards/${boardId}/cards/${cardId}/checklists`,
    UPDATE: (boardId: number, cardId: number, id: number) => `/boards/${boardId}/cards/${cardId}/checklists/${id}`,
    DELETE: (boardId: number, cardId: number, id: number) => `/boards/${boardId}/cards/${cardId}/checklists/${id}`,
    ITEMS: {
      CREATE: (boardId: number, cardId: number, checklistId: number) => `/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items`,
      UPDATE: (boardId: number, cardId: number, checklistId: number, id: number) => `/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${id}`,
      DELETE: (boardId: number, cardId: number, checklistId: number, id: number) => `/boards/${boardId}/cards/${cardId}/checklists/${checklistId}/items/${id}`,
    },
  },
};

// ============================================================================
// UNIFIED API SERVICE CLASS
// ============================================================================

class UnifiedApiService {
  private handleError(error: unknown): { status: false; message: string; errors: string[]; code: number; timestamp: string } {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          errors?: string[];
          code?: string;
        };
      };
      message?: string;
    };
    const message = axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred';
    const errors = axiosError.response?.data?.errors || [message];
    const code = axiosError.response?.data?.code || 'UNKNOWN_ERROR';
    
    return {
      status: false,
      message,
      errors,
      code: typeof code === 'string' ? parseInt(code) || 500 : code || 500,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================================
  // GENERIC HTTP METHODS
  // ============================================================================

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await jwtAxios.get<T>(url, { params });
      return response.data as ApiResponse<T>;
    } catch (error: unknown) {
      const apiError = this.handleError(error);
      return {
        status: false,
        data: undefined as T,
        message: apiError.message,
        code: apiError.code || 500,
        timestamp: apiError.timestamp,
      };
    }
  }

  public async post<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await jwtAxios.post<T>(url, data);
      return response.data as ApiResponse<T>;
    } catch (error: unknown) {
      const apiError = this.handleError(error);
      return {
        status: false,
        data: undefined as T,
        message: apiError.message,
        code: apiError.code || 500,
        timestamp: apiError.timestamp,
      };
    }
  }

  public async put<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await jwtAxios.put<T>(url, data);
      return response.data as ApiResponse<T>;
    } catch (error: unknown) {
      const apiError = this.handleError(error);
      return {
        status: false,
        data: undefined as T,
        message: apiError.message,
        code: apiError.code || 500,
        timestamp: apiError.timestamp,
      };
    }
  }

  public async patch<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await jwtAxios.patch<T>(url, data);
      return response.data as ApiResponse<T>;
    } catch (error: unknown) {
      const apiError = this.handleError(error);
      return {
        status: false,
        data: undefined as T,
        message: apiError.message,
        code: apiError.code || 500,
        timestamp: apiError.timestamp,
      };
    }
  }

  public async delete<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await jwtAxios.delete<T>(url, { params });
      return response.data as ApiResponse<T>;
    } catch (error: unknown) {
      const apiError = this.handleError(error);
      return {
        status: false,
        data: undefined as T,
        message: apiError.message,
        code: apiError.code || 500,
        timestamp: apiError.timestamp,
      };
    }
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  public async login(email: string, password: string): Promise<ApiResponse<{ user: UnifiedMember; token: string }>> {
    return this.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  }

  public async logout(): Promise<ApiResponse<boolean>> {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  public async register(userData: Partial<UnifiedMember> & { password: string }): Promise<ApiResponse<{ user: UnifiedMember; token: string }>> {
    return this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  public async getCurrentUser(): Promise<ApiResponse<UnifiedMember>> {
    return this.get(API_ENDPOINTS.AUTH.ME);
  }

  public async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.post(API_ENDPOINTS.AUTH.REFRESH);
  }

  // ============================================================================
  // USER/MEMBER METHODS
  // ============================================================================

  public async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<UnifiedMember[]>> {
    return this.get(API_ENDPOINTS.USERS.LIST, params);
  }

  public async getUser(id: number): Promise<ApiResponse<UnifiedMember>> {
    return this.get(API_ENDPOINTS.USERS.GET(id));
  }

  public async createUser(userData: Partial<UnifiedMember> & { password: string }): Promise<ApiResponse<UnifiedMember>> {
    return this.post(API_ENDPOINTS.USERS.CREATE, userData);
  }

  public async updateUser(id: number, userData: Partial<UnifiedMember>): Promise<ApiResponse<UnifiedMember>> {
    return this.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
  }

  public async deleteUser(id: number): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.USERS.DELETE(id));
  }

  public async searchUsers(query: string): Promise<ApiResponse<UnifiedMember[]>> {
    return this.get(API_ENDPOINTS.USERS.SEARCH, { q: query });
  }

  // ============================================================================
  // BOARD METHODS
  // ============================================================================

  public async getBoards(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<UnifiedBoard[]>> {
    return this.get(API_ENDPOINTS.BOARDS.LIST, params);
  }

  public async getBoard(id: number): Promise<ApiResponse<UnifiedBoard>> {
    return this.get(API_ENDPOINTS.BOARDS.GET(id));
  }

  public async createBoard(boardData: Partial<UnifiedBoard>): Promise<ApiResponse<UnifiedBoard>> {
    return this.post(API_ENDPOINTS.BOARDS.CREATE, boardData);
  }

  public async updateBoard(id: number, boardData: Partial<UnifiedBoard>): Promise<ApiResponse<UnifiedBoard>> {
    return this.put(API_ENDPOINTS.BOARDS.UPDATE(id), boardData);
  }

  public async deleteBoard(id: number): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.BOARDS.DELETE(id));
  }

  // ============================================================================
  // BOARD MEMBER METHODS
  // ============================================================================

  public async getBoardMembers(boardId: number): Promise<ApiResponse<UnifiedBoardMember[]>> {
    return this.get(API_ENDPOINTS.BOARDS.MEMBERS(boardId));
  }

  public async addBoardMember(boardId: number, memberId: number, role: TeamRole): Promise<ApiResponse<UnifiedBoardMember>> {
    return this.post(API_ENDPOINTS.BOARDS.ADD_MEMBER(boardId), { memberId, role });
  }

  public async removeBoardMember(boardId: number, memberId: number): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.BOARDS.REMOVE_MEMBER(boardId, memberId));
  }

  public async updateBoardMemberRole(boardId: number, memberId: number, role: TeamRole): Promise<ApiResponse<UnifiedBoardMember>> {
    return this.put(API_ENDPOINTS.BOARDS.UPDATE_MEMBER_ROLE(boardId, memberId), { role });
  }

  // ============================================================================
  // LIST METHODS
  // ============================================================================

  public async getLists(boardId: number): Promise<ApiResponse<UnifiedList[]>> {
    return this.get(API_ENDPOINTS.LISTS.LIST(boardId));
  }

  public async getList(boardId: number, listId: number): Promise<ApiResponse<UnifiedList>> {
    return this.get(API_ENDPOINTS.LISTS.GET(boardId, listId));
  }

  public async createList(boardId: number, listData: Partial<UnifiedList>): Promise<ApiResponse<UnifiedList>> {
    return this.post(API_ENDPOINTS.LISTS.CREATE(boardId), listData);
  }

  public async updateList(boardId: number, listId: number, listData: Partial<UnifiedList>): Promise<ApiResponse<UnifiedList>> {
    return this.put(API_ENDPOINTS.LISTS.UPDATE(boardId, listId), listData);
  }

  public async deleteList(boardId: number, listId: number): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.LISTS.DELETE(boardId, listId));
  }

  public async reorderLists(boardId: number, listIds: number[]): Promise<ApiResponse<boolean>> {
    return this.put(API_ENDPOINTS.LISTS.REORDER(boardId), { listIds });
  }

  // ============================================================================
  // CARD METHODS
  // ============================================================================

  public async getCards(boardId: number, listId: number): Promise<ApiResponse<UnifiedCard[]>> {
    return this.get(API_ENDPOINTS.CARDS.LIST(boardId, listId));
  }

  public async getCard(boardId: number, listId: number, cardId: number): Promise<ApiResponse<UnifiedCard>> {
    return this.get(API_ENDPOINTS.CARDS.GET(boardId, listId, cardId));
  }

  public async createCard(boardId: number, listId: number, cardData: Partial<UnifiedCard>): Promise<ApiResponse<UnifiedCard>> {
    return this.post(API_ENDPOINTS.CARDS.CREATE(boardId, listId), cardData);
  }

  public async updateCard(boardId: number, listId: number, cardId: number, cardData: Partial<UnifiedCard>): Promise<ApiResponse<UnifiedCard>> {
    return this.put(API_ENDPOINTS.CARDS.UPDATE(boardId, listId, cardId), cardData);
  }

  public async deleteCard(boardId: number, listId: number, cardId: number): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.CARDS.DELETE(boardId, listId, cardId));
  }

  public async moveCard(boardId: number, cardId: number, toListId: number, position: number): Promise<ApiResponse<UnifiedCard>> {
    return this.put(API_ENDPOINTS.CARDS.MOVE(boardId, cardId), { toListId, position });
  }

  public async assignCard(boardId: number, cardId: number, userId: number): Promise<ApiResponse<UnifiedCard>> {
    return this.post(API_ENDPOINTS.CARDS.ASSIGN(boardId, cardId), { userId });
  }

  public async unassignCard(boardId: number, cardId: number, userId: number): Promise<ApiResponse<UnifiedCard>> {
    return this.post(API_ENDPOINTS.CARDS.UNASSIGN(boardId, cardId), { userId });
  }

  // ============================================================================
  // NOTIFICATION METHODS
  // ============================================================================

  public async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<ApiResponse<UnifiedNotification[]>> {
    return this.get(API_ENDPOINTS.NOTIFICATIONS.LIST, params);
  }

  public async getNotification(id: number): Promise<ApiResponse<UnifiedNotification>> {
    return this.get(API_ENDPOINTS.NOTIFICATIONS.GET(id));
  }

  public async markNotificationAsRead(id: number): Promise<ApiResponse<UnifiedNotification>> {
    return this.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  }

  public async markAllNotificationsAsRead(): Promise<ApiResponse<boolean>> {
    return this.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  }

  public async deleteNotification(id: number): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
  }

  public async clearAllNotifications(): Promise<ApiResponse<boolean>> {
    return this.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const unifiedApiService = new UnifiedApiService();
export default unifiedApiService;