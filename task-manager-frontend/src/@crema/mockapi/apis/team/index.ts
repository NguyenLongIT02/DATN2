/**
 * Team Management API Mock
 */

import { TeamMember, BoardMember, TeamRole } from '@crema/services/PermissionService';
import { memberList } from '../../fakedb/apps/scrumboard/memberList';
import NotificationService from '../notifications/NotificationService';

// Mock data cho team members - sync hoàn toàn với ScrumBoard memberList
export const mockTeamMembers: TeamMember[] = memberList.map(member => ({
  ...member,
  role: (member.role as TeamRole) || TeamRole.MEMBER, // Ensure role is always defined
  joinedAt: member.joinedAt || new Date().toISOString(), // Ensure joinedAt is always defined
  lastActive: member.lastActive || new Date().toISOString(), // Ensure lastActive is always defined
  boards: member.boards || 0, // Ensure boards is always defined
  tasks: member.tasks || 0, // Ensure tasks is always defined
}));

// Default mock data cho board members
const defaultMockBoardMembers: BoardMember[] = [
  {
    id: 1,
    memberId: 500, // John Doe - Owner
    boardId: 2001,
    role: TeamRole.OWNER,
    joinedAt: '2024-01-15T08:00:00Z',
    member: mockTeamMembers.find(m => m.id === 500)!,
  },
  {
    id: 2,
    memberId: 502, // Joe Root - Admin
    boardId: 2001,
    role: TeamRole.ADMIN,
    joinedAt: '2024-01-16T09:00:00Z',
    member: mockTeamMembers.find(m => m.id === 502)!,
  },
  {
    id: 3,
    memberId: 501, // Johnson - Member
    boardId: 2001,
    role: TeamRole.MEMBER,
    joinedAt: '2024-01-15T10:00:00Z',
    member: mockTeamMembers.find(m => m.id === 501)!,
  },
  {
    id: 4,
    memberId: 503, // Monty Panesar - Member
    boardId: 2001,
    role: TeamRole.MEMBER,
    joinedAt: '2024-01-17T11:00:00Z',
    member: mockTeamMembers.find(m => m.id === 503)!,
  },
  {
    id: 5,
    memberId: 504, // Darren Gough - Viewer
    boardId: 2001,
    role: TeamRole.VIEWER,
    joinedAt: '2024-01-18T08:30:00Z',
    member: mockTeamMembers.find(m => m.id === 504)!,
  },
  {
    id: 6,
    memberId: 505, // Andy Caddick - Member
    boardId: 2001,
    role: TeamRole.MEMBER,
    joinedAt: '2024-01-19T13:00:00Z',
    member: mockTeamMembers.find(m => m.id === 505)!,
  },
  {
    id: 7,
    memberId: 506, // Marcus Vaughan - Member
    boardId: 2001,
    role: TeamRole.MEMBER,
    joinedAt: '2024-01-20T14:00:00Z',
    member: mockTeamMembers.find(m => m.id === 506)!,
  },
  // Board 44386315 - Board mới được tạo
  {
    id: 8,
    memberId: 500, // John Doe - Owner
    boardId: 44386315,
    role: TeamRole.OWNER,
    joinedAt: '2024-01-21T08:00:00Z',
    member: mockTeamMembers.find(m => m.id === 500)!,
  },
];

// Load from localStorage if available, otherwise use default data
const loadBoardMembersData = (): BoardMember[] => {
  try {
    const saved = localStorage.getItem('team_board_members');
    if (saved) {
      console.log('Team API: Loading board members from localStorage');
      const parsed = JSON.parse(saved);
      // Ensure member objects are properly linked
      return parsed.map((bm: BoardMember) => ({
        ...bm,
        member: mockTeamMembers.find(m => m.id === bm.memberId) || bm.member
      }));
    }
  } catch (error) {
    console.error('Team API: Error loading board members from localStorage', error);
  }
  console.log('Team API: Using default board members data');
  return defaultMockBoardMembers;
};

// Save to localStorage
const saveBoardMembersData = (data: BoardMember[]) => {
  try {
    localStorage.setItem('team_board_members', JSON.stringify(data));
    console.log('Team API: Saved board members to localStorage');
    
    // Trigger custom event to notify Reports component
    window.dispatchEvent(new CustomEvent('scrumboardDataChanged'));
  } catch (error) {
    console.error('Team API: Error saving board members to localStorage', error);
  }
};

// Initialize board members data with localStorage persistence
export let mockBoardMembers: BoardMember[] = loadBoardMembersData();

// Listen for storage changes to sync across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'team_board_members' && e.newValue) {
      console.log('🔄 Team storage changed, reloading board members');
      mockBoardMembers = loadBoardMembersData();
    }
  });
}

/**
 * Team Service Mock
 */
export class TeamService {
  /**
   * Lấy danh sách tất cả team members
   */
  static async getTeamMembers(): Promise<TeamMember[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockTeamMembers]);
      }, 500);
    });
  }

  /**
   * Lấy danh sách members của một board cụ thể
   */
  static async getBoardMembers(boardId: number): Promise<BoardMember[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Reload from localStorage to ensure we have latest data
        mockBoardMembers = loadBoardMembersData();
        const boardMembers = mockBoardMembers.filter(member => member.boardId === boardId);
        resolve([...boardMembers]);
      }, 300);
    });
  }

  /**
   * Lấy danh sách members của board cụ thể (synchronous)
   */
  static getBoardMembersSync(boardId: number): BoardMember[] {
    console.log(`🔍 TeamService.getBoardMembersSync called for boardId: ${boardId}`);
    
    // Reload from localStorage to ensure we have latest data
    mockBoardMembers = loadBoardMembersData();
    
    console.log(`📊 Total mockBoardMembers: ${mockBoardMembers.length}`);
    console.log(`📋 All boardIds in mockBoardMembers:`, mockBoardMembers.map(m => m.boardId));
    
    let result = mockBoardMembers.filter(member => member.boardId === boardId);
    
    // If no members found for this board, auto-add owner (John Doe - ID 500)
    if (result.length === 0) {
      console.log(`⚠️ No members found for board ${boardId}, auto-adding owner...`);
      const ownerMember = mockTeamMembers.find(m => m.id === 500);
      if (ownerMember) {
        const newBoardMember: BoardMember = {
          id: Math.max(...mockBoardMembers.map(m => m.id), 0) + 1,
          memberId: 500,
          boardId: boardId,
          role: TeamRole.OWNER,
          joinedAt: new Date().toISOString(),
          member: ownerMember,
        };
        
        mockBoardMembers.push(newBoardMember);
        saveBoardMembersData(mockBoardMembers);
        result = [newBoardMember];
        console.log(`✅ Auto-added owner to board ${boardId}`);
      }
    }
    
    console.log(`✅ Found ${result.length} members for board ${boardId}:`, result);
    
    return result;
  }

  /**
   * Thêm member vào team
   */
  static async addTeamMember(memberData: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMember: TeamMember = {
          ...memberData,
          id: Math.max(...mockTeamMembers.map(m => m.id)) + 1,
          joinedAt: new Date().toISOString(),
        };
        mockTeamMembers.push(newMember);
        resolve(newMember);
      }, 500);
    });
  }

  /**
   * Cập nhật thông tin member
   */
  static async updateTeamMember(memberId: number, updates: Partial<TeamMember>): Promise<TeamMember> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const memberIndex = mockTeamMembers.findIndex(m => m.id === memberId);
        if (memberIndex === -1) {
          reject(new Error('Member not found'));
          return;
        }
        
        mockTeamMembers[memberIndex] = { ...mockTeamMembers[memberIndex], ...updates };
        resolve(mockTeamMembers[memberIndex]);
      }, 400);
    });
  }

  /**
   * Xóa member khỏi team và đồng bộ với ScrumBoard
   */
  static async removeTeamMember(memberId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Xóa khỏi mockTeamMembers
          const memberIndex = mockTeamMembers.findIndex(m => m.id === memberId);
          if (memberIndex === -1) {
            reject(new Error('Member not found'));
            return;
          }
          
          mockTeamMembers.splice(memberIndex, 1);
          
          // Đồng bộ với ScrumBoard memberList
          const scrumMemberIndex = memberList.findIndex(m => m.id === memberId);
          if (scrumMemberIndex !== -1) {
            memberList.splice(scrumMemberIndex, 1);
          }
          
          // Xóa khỏi tất cả boards
          const boardMemberIndices = mockBoardMembers
            .map((bm, index) => bm.memberId === memberId ? index : -1)
            .filter(index => index !== -1)
            .reverse(); // Reverse để xóa từ cuối lên đầu
          
          boardMemberIndices.forEach(index => {
            mockBoardMembers.splice(index, 1);
          });
          
          console.log(`Member ${memberId} removed from team and all boards`);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, 400);
    });
  }

  /**
   * Thêm member vào board
   */
  static async addBoardMember(boardId: number, memberId: number, role: TeamRole): Promise<BoardMember> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`🔍 TeamService.addBoardMember called: boardId=${boardId}, memberId=${memberId}, role=${role}`);
        
        // Reload from localStorage to ensure we have latest data
        mockBoardMembers = loadBoardMembersData();
        
        const member = mockTeamMembers.find(m => m.id === memberId);
        if (!member) {
          console.error(`❌ Member ${memberId} not found in mockTeamMembers`);
          reject(new Error('Member not found'));
          return;
        }

        // Check if member is already in board
        const existingMember = mockBoardMembers.find(m => m.boardId === boardId && m.memberId === memberId);
        if (existingMember) {
          console.log(`⚠️ Member ${memberId} already exists in board ${boardId}, updating role`);
          existingMember.role = role;
          saveBoardMembersData(mockBoardMembers);
          resolve(existingMember);
          return;
        }

        const newBoardMember: BoardMember = {
          id: Math.max(...mockBoardMembers.map(m => m.id), 0) + 1,
          memberId,
          boardId,
          role,
          joinedAt: new Date().toISOString(),
          member,
        };
        
        mockBoardMembers.push(newBoardMember);
        saveBoardMembersData(mockBoardMembers);
        console.log(`✅ Added member ${memberId} to board ${boardId}. Total board members: ${mockBoardMembers.length}`);
        
        // Create notification for member assignment
        // Get board name from scrumboard data
        const boardData = JSON.parse(localStorage.getItem('scrumboard_boards') || '[]');
        const board = boardData.find((b: any) => b.id === boardId);
        const boardName = board?.name || 'Unknown Board';
        
        // Get actor info (assuming current user is John Doe for now)
        const actorId = 500;
        const actorName = 'John Doe';
        const actorAvatar = '/assets/images/avatar/A1.jpg';
        
        // Create notification for the assigned member
        NotificationService.notifyMemberAssigned(
          'New Assignment', // Generic card title since we don't have specific card context
          boardId,
          boardName,
          memberId,
          member.name,
          actorId,
          actorName,
          actorAvatar
        );
        
        resolve(newBoardMember);
      }, 400);
    });
  }

  /**
   * Cập nhật role của member trong board
   */
  static async updateBoardMemberRole(boardId: number, memberId: number, newRole: TeamRole): Promise<BoardMember> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Reload from localStorage to ensure we have latest data
        mockBoardMembers = loadBoardMembersData();
        
        const boardMemberIndex = mockBoardMembers.findIndex(
          m => m.boardId === boardId && m.memberId === memberId
        );
        
        if (boardMemberIndex === -1) {
          reject(new Error('Board member not found'));
          return;
        }
        
        mockBoardMembers[boardMemberIndex].role = newRole;
        saveBoardMembersData(mockBoardMembers);
        resolve(mockBoardMembers[boardMemberIndex]);
      }, 400);
    });
  }

  /**
   * Xóa member khỏi board cụ thể (không xóa khỏi team)
   */
  static async removeBoardMember(boardId: number, memberId: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Reload from localStorage to ensure we have latest data
          mockBoardMembers = loadBoardMembersData();
          
          const boardMemberIndex = mockBoardMembers.findIndex(
            m => m.boardId === boardId && m.memberId === memberId
          );
          
          if (boardMemberIndex === -1) {
            reject(new Error('Board member not found'));
            return;
          }
          
          mockBoardMembers.splice(boardMemberIndex, 1);
          saveBoardMembersData(mockBoardMembers);
          console.log(`Member ${memberId} removed from board ${boardId}`);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }, 400);
    });
  }


  /**
   * Tìm kiếm members
   */
  static async searchMembers(query: string): Promise<TeamMember[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredMembers = mockTeamMembers.filter(member =>
          member.name.toLowerCase().includes(query.toLowerCase()) ||
          member.email.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filteredMembers);
      }, 300);
    });
  }

  /**
   * Reset team board members storage (for debugging)
   */
  static resetTeamStorage(): void {
    try {
      localStorage.removeItem('team_board_members');
      mockBoardMembers = defaultMockBoardMembers;
      saveBoardMembersData(mockBoardMembers);
      console.log('Team storage reset successfully');
    } catch (error) {
      console.error('Error resetting team storage:', error);
    }
  }

  /**
   * Debug localStorage data (for debugging)
   */
  static debugStorage(): void {
    try {
      const saved = localStorage.getItem('team_board_members');
      console.log('🔍 localStorage data:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('📊 Parsed data:', parsed);
        console.log('📋 Board IDs in storage:', parsed.map((m: BoardMember) => m.boardId));
      }
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
  }
}

export default TeamService;
