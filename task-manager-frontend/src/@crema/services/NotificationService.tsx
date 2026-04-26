/**
 * NOTIFICATION SERVICE
 * Centralized notification management for error handling and user feedback
 */

import { message, notification } from 'antd';
import { AppError } from './ErrorHandler';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  description?: string;
  duration?: number;
  action?: string;
  retryable?: boolean;
  error?: AppError;
}

// ============================================================================
// NOTIFICATION SERVICE CLASS
// ============================================================================

class NotificationService {
  private notificationKey = 'task-manager-notification';

  // ============================================================================
  // MESSAGE NOTIFICATIONS (Top-right corner)
  // ============================================================================

  public showMessage(type: 'success' | 'error' | 'warning' | 'info', content: string, duration: number = 3) {
    message[type]({
      content,
      duration,
      style: {
        marginTop: '20px',
      },
    });
  }

  public showSuccessMessage(content: string, duration?: number) {
    this.showMessage('success', content, duration);
  }

  public showErrorMessage(content: string, duration?: number) {
    this.showMessage('error', content, duration);
  }

  public showWarningMessage(content: string, duration?: number) {
    this.showMessage('warning', content, duration);
  }

  public showInfoMessage(content: string, duration?: number) {
    this.showMessage('info', content, duration);
  }

  // ============================================================================
  // NOTIFICATION POPUPS (Top-right corner with more details)
  // ============================================================================

  public showNotification(config: NotificationConfig) {
    const {
      type,
      title,
      message: msg,
      description,
      duration = 4.5,
      action,
      retryable,
      error,
    } = config;

    const notificationConfig: any = {
      message: title,
      description: description || msg,
      duration,
      placement: 'topRight',
      key: this.notificationKey,
      style: {
        marginTop: '20px',
      },
    };

    // Add action button for retryable errors
    if (retryable && action) {
      notificationConfig.btn = (
        <button
          onClick={() => {
            notification.close(this.notificationKey);
            this.handleRetryAction(error);
          }}
          style={{
            background: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {action}
        </button>
      );
    }

    notification[type](notificationConfig);
  }

  public showSuccessNotification(title: string, message: string, description?: string) {
    this.showNotification({
      type: 'success',
      title,
      message,
      description,
    });
  }

  public showErrorNotification(title: string, message: string, description?: string, error?: AppError) {
    this.showNotification({
      type: 'error',
      title,
      message,
      description,
      error,
      retryable: error?.retryable,
      action: error?.action,
    });
  }

  public showWarningNotification(title: string, message: string, description?: string) {
    this.showNotification({
      type: 'warning',
      title,
      message,
      description,
    });
  }

  public showInfoNotification(title: string, message: string, description?: string) {
    this.showNotification({
      type: 'info',
      title,
      message,
      description,
    });
  }

  // ============================================================================
  // AUTHENTICATION NOTIFICATIONS
  // ============================================================================

  public showAuthError(error: AppError) {
    this.showErrorNotification(
      'Lỗi xác thực',
      error.userMessage || 'Phiên đăng nhập đã hết hạn',
      'Vui lòng đăng nhập lại để tiếp tục sử dụng',
      error
    );
  }

  public showLoginSuccess(userName: string) {
    this.showSuccessNotification(
      'Đăng nhập thành công',
      `Chào mừng ${userName}!`,
      'Bạn đã đăng nhập thành công vào hệ thống'
    );
  }

  public showLogoutSuccess() {
    this.showInfoNotification(
      'Đăng xuất thành công',
      'Bạn đã đăng xuất khỏi hệ thống',
      'Cảm ơn bạn đã sử dụng Task Manager'
    );
  }

  public showTokenRefreshSuccess() {
    this.showInfoMessage('Phiên đăng nhập đã được gia hạn');
  }

  public showTokenRefreshError() {
    this.showErrorNotification(
      'Phiên đăng nhập hết hạn',
      'Không thể gia hạn phiên đăng nhập',
      'Vui lòng đăng nhập lại'
    );
  }

  // ============================================================================
  // NETWORK NOTIFICATIONS
  // ============================================================================

  public showNetworkError(error: AppError) {
    this.showErrorNotification(
      'Lỗi kết nối',
      error.userMessage || 'Không thể kết nối đến máy chủ',
      'Vui lòng kiểm tra kết nối internet và thử lại',
      error
    );
  }

  public showConnectionRestored() {
    this.showSuccessNotification(
      'Kết nối đã được khôi phục',
      'Kết nối internet đã hoạt động trở lại',
      'Bạn có thể tiếp tục sử dụng ứng dụng'
    );
  }

  // ============================================================================
  // VALIDATION NOTIFICATIONS
  // ============================================================================

  public showValidationError(error: AppError) {
    this.showErrorNotification(
      'Dữ liệu không hợp lệ',
      error.userMessage || 'Vui lòng kiểm tra lại thông tin',
      'Một số trường dữ liệu không đúng định dạng',
      error
    );
  }

  public showFormValidationError(fieldName: string, message: string) {
    this.showErrorMessage(`${fieldName}: ${message}`);
  }

  // ============================================================================
  // ACTION NOTIFICATIONS
  // ============================================================================

  public showSaveSuccess(itemName: string) {
    this.showSuccessMessage(`${itemName} đã được lưu thành công`);
  }

  public showDeleteSuccess(itemName: string) {
    this.showSuccessMessage(`${itemName} đã được xóa thành công`);
  }

  public showUpdateSuccess(itemName: string) {
    this.showSuccessMessage(`${itemName} đã được cập nhật thành công`);
  }

  public showCreateSuccess(itemName: string) {
    this.showSuccessMessage(`${itemName} đã được tạo thành công`);
  }

  // ============================================================================
  // LOADING NOTIFICATIONS
  // ============================================================================

  public showLoadingMessage(message: string) {
    this.showInfoMessage(`Đang ${message}...`);
  }

  public showSavingMessage() {
    this.showLoadingMessage('lưu dữ liệu');
  }

  public showLoadingDataMessage() {
    this.showLoadingMessage('tải dữ liệu');
  }

  // ============================================================================
  // RETRY HANDLING
  // ============================================================================

  private handleRetryAction(error?: AppError) {
    if (!error) return;

    // Dispatch retry event
    window.dispatchEvent(new CustomEvent('error:retry', {
      detail: { error }
    }));
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  public closeAll() {
    notification.destroy();
    message.destroy();
  }

  public closeNotification(key: string) {
    notification.close(key);
  }

  public closeMessage() {
    message.destroy();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const notificationService = new NotificationService();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export const showSuccess = (title: string, message: string, description?: string) => 
  notificationService.showSuccessNotification(title, message, description);

export const showError = (title: string, message: string, description?: string, error?: AppError) => 
  notificationService.showErrorNotification(title, message, description, error);

export const showWarning = (title: string, message: string, description?: string) => 
  notificationService.showWarningNotification(title, message, description);

export const showInfo = (title: string, message: string, description?: string) => 
  notificationService.showInfoNotification(title, message, description);

export const showMessage = (type: 'success' | 'error' | 'warning' | 'info', content: string) => 
  notificationService.showMessage(type, content);

export default notificationService;
