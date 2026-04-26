/**
 * BOARD MEMBER SERVICE - Real backend integration
 * Sử dụng backend APIs thực tế thay vì mock
 */

import { jwtAxios } from './auth/jwt-auth';

// ============================================================================
// TYPES
// ============================================================================

export interface BoardMember {
  id: number;
  memberId: number;
  boardId: number;
  role: 'PM' | 'TEAM_LEAD' | 'MEMBER';
  joinedAt: string;
  member: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    lastActive?: string;
    boards?: number;
    tasks?: number;
  };
}

export interface TeamMember {
  id: number;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  role?: string;
  joinedAt?: string;
  lastActive?: string;
  boards?: number;
  tasks?: number;
}

// ============================================================================
// BOARD MEMBER SERVICE
// ============================================================================

class BoardMemberService {
  /**
   * Get board members from backend
   */
  public async getBoardMembers(boardId: number): Promise<BoardMember[]> {
    try {
      const response = await jwtAxios.get(`/scrumboard/member/${boardId}`);
      
      if (response.data && response.data.status) {
        const mappedMembers = response.data.data.map((member: any) => ({
          id: member.id,
          memberId: member.id,
          boardId: boardId,
          role: member.role,
          joinedAt: member.joinedAt,
          member: {
            id: member.id,
            name: member.name,
            username: member.username,
            email: member.email,
            avatar: member.avatar,
            lastActive: member.lastActive,
            boards: member.boards || 0,
            tasks: member.tasks || 0,
            role: member.role,
            joinedAt: member.joinedAt,
          }
        }));
        return mappedMembers;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get board members:', error);
      throw error;
    }
  }

  /**
   * Add member to board
   */
  public async addBoardMember(
    boardId: number, 
    userId: number, 
    role: 'PM' | 'TEAM_LEAD' | 'MEMBER' = 'MEMBER'
  ): Promise<BoardMember> {
    try {
      const response = await jwtAxios.post(`/scrumboard/member/${boardId}/${userId}`, {
        role: role
      });
      
      if (response.data && response.data.status) {
        const member = response.data.data;
        return {
          id: member.id,
          memberId: member.userId,
          boardId: member.boardId,
          role: member.role,
          joinedAt: member.joinedAt,
          member: {
            id: member.userId,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            lastActive: member.lastActive,
            boards: member.boards || 0,
            tasks: member.tasks || 0,
          }
        };
      }
      
      throw new Error('Failed to add board member');
    } catch (error) {
      console.error('Failed to add board member:', error);
      throw error;
    }
  }

  /**
   * Remove member from board
   */
  public async removeBoardMember(boardId: number, userId: number): Promise<boolean> {
    try {
      const response = await jwtAxios.delete(`/scrumboard/member/${boardId}/${userId}`);
      
      return response.data && response.data.status;
    } catch (error) {
      console.error('Failed to remove board member:', error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  public async updateMemberRole(
    boardId: number, 
    userId: number, 
    role: 'PM' | 'TEAM_LEAD' | 'MEMBER' | string
  ): Promise<BoardMember> {
    // Chuyển đổi enum/string từ frontend sang đúng định dạng string mà backend cần
    let backendRoleName = role;
    if (role === 'PM') backendRoleName = 'Project Manager';
    else if (role === 'TEAM_LEAD') backendRoleName = 'Team Lead';
    else if (role === 'MEMBER') backendRoleName = 'Member';

    try {
      const response = await jwtAxios.put(`/scrumboard/member/${boardId}/${userId}/role`, null, {
        params: { role: backendRoleName }
      });
      
      if (response.data && response.data.status) {
        const member = response.data.data;
        return {
          id: member.id,
          memberId: member.userId,
          boardId: member.boardId,
          role: member.role,
          joinedAt: member.joinedAt,
          member: {
            id: member.userId,
            name: member.name,
            email: member.email,
            avatar: member.avatar,
            lastActive: member.lastActive,
            boards: member.boards || 0,
            tasks: member.tasks || 0,
          }
        };
      }
      
      throw new Error('Failed to update member role');
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  }

  /**
   * Get all available team members (for dropdown)
   * Since /users endpoint doesn't exist, return empty array for now
   */
  public async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      return [];
    } catch (error) {
      console.error('Failed to get all team members:', error);
      return [];
    }
  }

  public async searchTeamMembers(query: string): Promise<TeamMember[]> {
    try {
      return [];
    } catch (error) {
      console.error('Failed to search team members:', error);
      return [];
    }
  }
}

// Export singleton instance
export const boardMemberService = new BoardMemberService();
export default boardMemberService;
