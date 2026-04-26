/**
 * INVITATION SERVICE - Real backend integration
 * Tích hợp với backend invitation APIs
 */

import { jwtAxios } from './auth/jwt-auth';

// ============================================================================
// TYPES
// ============================================================================

export interface InviteRequest {
  email: string;
}

export interface InviteResponse {
  message: string;
  token?: string;
  expiresInHours?: number;
}

export interface InvitationAcceptRequest {
  token: string;
}

export interface InvitationAcceptResponse {
  success: boolean;
  message: string;
  boardId?: number;
  boardName?: string;
}

// ============================================================================
// INVITATION SERVICE
// ============================================================================

class InvitationService {
  /**
   * Invite user to board by email
   */
  public async inviteUserToBoard(
    boardId: number, 
    email: string
  ): Promise<InviteResponse> {
    try {
      const response = await jwtAxios.post(`/scrumboard/boards/${boardId}/invite`, {
        email: email
      });
      
      if (response.data && response.data.status) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to send invitation');
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      throw error;
    }
  }

  /**
   * Accept invitation (authenticated user)
   */
  public async acceptInvitation(token: string): Promise<InvitationAcceptResponse> {
    try {
      const response = await jwtAxios.get(`/scrumboard/invitations/accept`, {
        params: { token: token }
      });
      
      if (response.data && response.data.status) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to accept invitation');
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  /**
   * Complete invitation (after login)
   */
  public async completeInvitation(token: string): Promise<InvitationAcceptResponse> {
    try {
      const response = await jwtAxios.post(`/scrumboard/invitations/complete-after-login`, 
        `token=${token}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      if (response.data && response.data.status) {
        return response.data.data;
      }
      
      throw new Error(response.data?.message || 'Failed to complete invitation');
    } catch (error: any) {
      console.error('Failed to complete invitation:', error);
      throw error;
    }
  }

  /**
   * Get pending invitations for current user
   */
  public async getPendingInvitations(): Promise<any[]> {
    try {
      const response = await jwtAxios.get(`/scrumboard/invitations/pending`);
      
      if (response.data && response.data.status) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to get pending invitations:', error);
      return [];
    }
  }

  /**
   * Decline invitation
   */
  public async declineInvitation(token: string): Promise<boolean> {
    try {
      const response = await jwtAxios.post(`/scrumboard/invitations/decline`, {
        token: token
      });
      
      return response.data && response.data.status;
    } catch (error: any) {
      console.error('Failed to decline invitation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const invitationService = new InvitationService();
export default invitationService;
