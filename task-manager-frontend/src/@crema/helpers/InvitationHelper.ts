/**
 * INVITATION HELPER
 * Xử lý pending invitation sau khi user đăng ký/đăng nhập thành công
 */

import { invitationService } from '../services/InvitationService';

export interface PendingInvitation {
  token: string;
  email: string;
  boardId?: number;
  boardName?: string;
}

/**
 * Xử lý pending invitation sau khi user đăng ký/đăng nhập thành công
 */
export const processPendingInvitation = async (userData: any): Promise<boolean> => {
  try {
    // Kiểm tra có pending invitation không
    const pendingInvitationStr = localStorage.getItem('pendingInvitation');
    
    if (!pendingInvitationStr) {
      console.log('No pending invitation found');
      return false;
    }

    const invitationData: PendingInvitation = JSON.parse(pendingInvitationStr);
    console.log('Processing pending invitation after auth:', invitationData);

    // Gọi API để hoàn tất invitation
    const response = await invitationService.completeInvitation(invitationData.token);
    
    if (response.success) {
      console.log('Successfully joined board:', response);
      
      // Xóa pending invitation
      localStorage.removeItem('pendingInvitation');
      
      // Redirect đến board
      if (response.boardId) {
        window.location.href = `/collaboration/kanban-board/${response.boardId}`;
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error processing invitation:', error);
    return false;
  }
};

/**
 * Lưu invitation data vào localStorage từ URL parameters
 */
export const saveInvitationFromUrl = (): boolean => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const redirect = urlParams.get('redirect');
    
    if (email && redirect) {
      // Parse redirect URL để lấy token
      const redirectUrl = new URL(redirect, window.location.origin);
      const token = redirectUrl.searchParams.get('token');
      
      if (token) {
        const invitationData: PendingInvitation = {
          token,
          email,
        };
        
        localStorage.setItem('pendingInvitation', JSON.stringify(invitationData));
        console.log('Saved pending invitation:', invitationData);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error saving invitation from URL:', error);
    return false;
  }
};

/**
 * Kiểm tra và xử lý invitation từ URL khi trang load
 */
export const handleInvitationOnPageLoad = (): boolean => {
  return saveInvitationFromUrl();
};
