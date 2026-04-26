import { message, notification } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

/**
 * Notification Helper with i18n support
 * Provides easy-to-use functions for displaying notifications and messages
 * Supports both English and Vietnamese languages
 */

// Get intl instance from global context
// This is set up in IntlGlobalProvider
let intl: any = null;

// Helper to get intl instance
const getIntl = () => {
  // Always try to get the latest intl instance from window
  // This ensures we get the current language setting
  if (typeof window !== "undefined" && (window as any).intl) {
    intl = (window as any).intl;
  }
  return intl;
};

// Helper to format message with i18n
const formatMessage = (id: string, values?: Record<string, any>): string => {
  const intlInstance = getIntl();
  if (intlInstance && intlInstance.formatMessage) {
    try {
      return intlInstance.formatMessage({ id }, values);
    } catch (error) {
      console.warn(`Translation key not found: ${id}`, error);
      return id;
    }
  }
  // Fallback to key if intl not available
  console.warn(`Intl not available for key: ${id}`);
  return id;
};

// Message types (simple toast-like notifications)
export const showSuccessMessage = (content: string, duration = 3) => {
  message.success({
    content,
    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    duration,
  });
};

export const showErrorMessage = (content: string, duration = 3) => {
  message.error({
    content,
    icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    duration,
  });
};

export const showWarningMessage = (content: string, duration = 3) => {
  message.warning({
    content,
    icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
    duration,
  });
};

export const showInfoMessage = (content: string, duration = 3) => {
  message.info({
    content,
    icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
    duration,
  });
};

// Notification types (more detailed notifications with title and description)
export const showSuccessNotification = (
  description: string,
  title = "Success",
  duration = 4
) => {
  // Use App component instead of static function to avoid context warning
  notification.success({
    message: title,
    description,
    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    duration,
    placement: "topRight",
  });
};

export const showErrorNotification = (
  description: string,
  title = "Error",
  duration = 4
) => {
  notification.error({
    message: title,
    description,
    icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    duration,
    placement: "topRight",
  });
};

export const showWarningNotification = (
  description: string,
  title = "Warning",
  duration = 4
) => {
  notification.warning({
    message: title,
    description,
    icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
    duration,
    placement: "topRight",
  });
};

export const showInfoNotification = (
  description: string,
  title = "Info",
  duration = 4
) => {
  notification.info({
    message: title,
    description,
    icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
    duration,
    placement: "topRight",
  });
};

// Specific action notifications with i18n support
export const showCardMovedNotification = (
  cardTitle: string,
  fromList: string,
  toList: string
) => {
  const title = formatMessage("notification.card.moved");
  const description = formatMessage("notification.card.moved.description", {
    cardTitle,
    fromList,
    toList,
  });
  showSuccessNotification(description, title);
};

export const showCardCreatedNotification = (cardTitle: string) => {
  const title = formatMessage("notification.card.created");
  const description = formatMessage("notification.card.created.description", {
    cardTitle,
  });
  showSuccessNotification(description, title);
};

export const showCardUpdatedNotification = (cardTitle: string) => {
  const title = formatMessage("notification.card.updated");
  const description = formatMessage("notification.card.updated.description", {
    cardTitle,
  });
  showSuccessNotification(description, title);
};

export const showCardDeletedNotification = (cardTitle: string) => {
  const title = formatMessage("notification.card.deleted");
  const description = formatMessage("notification.card.deleted.description", {
    cardTitle,
  });
  showSuccessNotification(description, title);
};

export const showListCreatedNotification = (listName: string) => {
  const title = formatMessage("notification.list.created");
  const description = formatMessage("notification.list.created.description", {
    listName,
  });
  showSuccessNotification(description, title);
};

export const showListUpdatedNotification = (listName: string) => {
  const title = formatMessage("notification.list.updated");
  const description = formatMessage("notification.list.updated.description", {
    listName,
  });
  showSuccessNotification(description, title);
};

export const showListDeletedNotification = (listName: string) => {
  const title = formatMessage("notification.list.deleted");
  const description = formatMessage("notification.list.deleted.description", {
    listName,
  });
  showSuccessNotification(description, title);
};

export const showBoardCreatedNotification = (boardName: string) => {
  const title = formatMessage("notification.board.created");
  const description = formatMessage("notification.board.created.description", {
    boardName,
  });
  showSuccessNotification(description, title);
};

export const showBoardUpdatedNotification = (boardName: string) => {
  const title = formatMessage("notification.board.updated");
  const description = formatMessage("notification.board.updated.description", {
    boardName,
  });
  showSuccessNotification(description, title);
};

export const showBoardDeletedNotification = (boardName: string) => {
  const title = formatMessage("notification.board.deleted");
  const description = formatMessage("notification.board.deleted.description", {
    boardName,
  });
  showSuccessNotification(description, title);
};

// Task notifications
export const showTaskCreatedNotification = (taskTitle: string) => {
  const title = formatMessage("notification.task.created");
  const description = formatMessage("notification.task.created.description", {
    taskTitle,
  });
  showSuccessNotification(description, title);
};

export const showTaskUpdatedNotification = (taskTitle: string) => {
  const title = formatMessage("notification.task.updated");
  const description = formatMessage("notification.task.updated.description", {
    taskTitle,
  });
  showSuccessNotification(description, title);
};

export const showTaskDeletedNotification = (taskTitle: string) => {
  const title = formatMessage("notification.task.deleted");
  const description = formatMessage("notification.task.deleted.description", {
    taskTitle,
  });
  showSuccessNotification(description, title);
};

// Generic operation notifications with i18n support
export const showOperationSuccessNotification = (operation: string) => {
  const title = formatMessage("notification.operation.success");
  const description = formatMessage(
    "notification.operation.success.description",
    { operation }
  );
  showSuccessNotification(description, title);
};

export const showOperationErrorNotification = (
  operation: string,
  error?: string
) => {
  const title = formatMessage("notification.operation.failed");
  const description = formatMessage(
    "notification.operation.failed.description",
    { operation, error: error || "" }
  );
  showErrorNotification(description, title);
};

export const showLoadingMessage = (content = "Loading...") => {
  return message.loading(content, 0); // 0 means it won't auto close
};

export const showSaveSuccessMessage = () => {
  showSuccessMessage("Changes saved successfully");
};

export const showDeleteConfirmation = (
  onConfirm: () => void,
  itemName: string
) => {
  notification.warning({
    message: "Confirm Deletion",
    description: `Are you sure you want to delete "${itemName}"?`,
    duration: 0,
    btn: (
      <div>
        <button
          onClick={() => {
            notification.destroy();
            onConfirm();
          }}
          style={{
            marginRight: 8,
            padding: "4px 15px",
            backgroundColor: "#ff4d4f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
        <button
          onClick={() => notification.destroy()}
          style={{
            padding: "4px 15px",
            backgroundColor: "#d9d9d9",
            color: "rgba(0, 0, 0, 0.85)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    ),
    placement: "topRight",
  });
};
