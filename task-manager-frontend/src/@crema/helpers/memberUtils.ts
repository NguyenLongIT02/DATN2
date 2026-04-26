/**
 * Member Utility Functions
 * Chuyển đổi giữa các member types và đảm bảo compatibility
 */

import { MemberObjType } from '@crema/types/models/apps/ScrumbBoard';
import { TeamMember, TeamRole } from '@crema/services/PermissionService';

/**
 * Convert MemberObjType to TeamMember
 */
export const memberObjToTeamMember = (member: MemberObjType): TeamMember => {
  return {
    id: member.id,
    name: member.name,
    email: member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
    avatar: member.avatar,
    role: (member.role as TeamRole) || TeamRole.MEMBER,
    joinedAt: member.joinedAt || new Date().toISOString(),
    lastActive: member.lastActive,
    boards: member.boards || 0,
    tasks: member.tasks || 0,
  };
};

/**
 * Convert TeamMember to MemberObjType
 */
export const teamMemberToMemberObj = (member: TeamMember): MemberObjType => {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
    role: member.role,
    joinedAt: member.joinedAt,
    lastActive: member.lastActive,
    boards: member.boards,
    tasks: member.tasks,
  };
};

/**
 * Get member display name with fallback
 */
export const getMemberDisplayName = (member: MemberObjType | TeamMember): string => {
  return member.name || 'Unknown Member';
};

/**
 * Get member avatar with fallback
 */
export const getMemberAvatar = (member: MemberObjType | TeamMember): string => {
  return member.avatar || '/assets/images/avatar/default.jpg';
};

/**
 * Check if member has role
 */
export const hasRole = (member: MemberObjType | TeamMember, role: TeamRole): boolean => {
  return member.role === role;
};

/**
 * Get member role with fallback
 */
export const getMemberRole = (member: MemberObjType | TeamMember): TeamRole => {
  return (member.role as TeamRole) || TeamRole.MEMBER;
};

/**
 * Check if member is active (last active within 7 days)
 */
export const isMemberActive = (member: MemberObjType | TeamMember): boolean => {
  if (!member.lastActive) return false;
  
  const lastActiveDate = new Date(member.lastActive);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return lastActiveDate > sevenDaysAgo;
};

/**
 * Get member activity status
 */
export const getMemberActivityStatus = (member: MemberObjType | TeamMember): 'active' | 'inactive' | 'unknown' => {
  if (!member.lastActive) return 'unknown';
  
  const lastActiveDate = new Date(member.lastActive);
  const now = new Date();
  const diffInHours = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) return 'active';
  if (diffInHours < 168) return 'active'; // 7 days
  return 'inactive';
};

