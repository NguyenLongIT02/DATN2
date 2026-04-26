/**
 * Role Utilities - Các hàm tiện ích để xử lý roles
 */

import { TeamRole } from '@crema/services/PermissionService';

/**
 * Lấy màu sắc cho role tag
 */
export const getRoleColor = (role: TeamRole | string): string => {
  const roleStr = typeof role === 'string' ? role : String(role);
  switch (roleStr) {
    case 'PM':
      return 'red';
    case 'TEAM_LEAD':
      return 'purple';
    case 'ADMIN':
    case TeamRole.ADMIN:
      return 'blue';
    case 'MEMBER':
    case TeamRole.MEMBER:
      return 'green';
    case 'VIEWER':
    case TeamRole.VIEWER:
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Lấy icon cho role
 */
export const getRoleIcon = (role: TeamRole | string): string => {
  const roleStr = typeof role === 'string' ? role : String(role);
  switch (roleStr) {
    case 'PM':
      return '👑';
    case 'TEAM_LEAD':
      return '📋';
    case 'ADMIN':
    case TeamRole.ADMIN:
      return '⚡';
    case 'MEMBER':
    case TeamRole.MEMBER:
      return '👤';
    case 'VIEWER':
    case TeamRole.VIEWER:
      return '👁️';
    default:
      return '❓';
  }
};

/**
 * Lấy tên hiển thị của role
 */
export const getRoleDisplayName = (role: TeamRole | string): string => {
  const roleStr = typeof role === 'string' ? role : String(role);
  switch (roleStr) {
    case 'PM':
      return 'Project Manager';
    case 'TEAM_LEAD':
      return 'Team Lead';
    case 'ADMIN':
    case TeamRole.ADMIN:
      return 'Admin';
    case 'MEMBER':
    case TeamRole.MEMBER:
      return 'Member';
    case 'VIEWER':
    case TeamRole.VIEWER:
      return 'Viewer';
    default:
      return 'Unknown';
  }
};

/**
 * Lấy mô tả của role
 */
export const getRoleDescription = (role: TeamRole): string => {
  switch (role) {
    case TeamRole.PM:
      return 'Có quyền cao nhất, quản lý toàn bộ board';
    case TeamRole.TEAM_LEAD:
      return 'Có thể mời thành viên, thay đổi vai trò và chỉnh sửa board';
    case TeamRole.MEMBER:
      return 'Có thể xem và chỉ bình luận, cập nhật checklist';
    case TeamRole.VIEWER:
      return 'Chỉ có quyền xem (read-only)';
    default:
      return 'Không xác định';
  }
};

/**
 * Format role cho hiển thị
 */
export const formatRole = (role: TeamRole): { 
  name: string; 
  color: string; 
  icon: string; 
  description: string; 
} => {
  return {
    name: getRoleDisplayName(role),
    color: getRoleColor(role),
    icon: getRoleIcon(role),
    description: getRoleDescription(role),
  };
};

/**
 * Kiểm tra xem role có phải là admin level không
 */
export const isAdminLevel = (role: TeamRole): boolean => {
  return role === TeamRole.PM || role === TeamRole.TEAM_LEAD;
};

/**
 * Kiểm tra xem role có thể edit không
 */
export const canEdit = (role: TeamRole): boolean => {
  return role === TeamRole.PM || role === TeamRole.TEAM_LEAD;
};

/**
 * Kiểm tra xem role có thể view không
 */
export const canView = (role: TeamRole): boolean => {
  return Object.values(TeamRole).includes(role);
};

