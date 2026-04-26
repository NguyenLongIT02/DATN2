import { useEffect } from "react";
import { message, notification } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import AppLoader from "../AppLoader";

import {
  useInfoViewActionsContext,
  useInfoViewContext,
} from "@crema/context/AppContextProvider/InfoViewContextProvider";

// Configure message globally
message.config({
  top: 24,
  duration: 4,
  maxCount: 1,
  getContainer: () => document.body,
});

// Configure notification globally
notification.config({
  placement: "topRight",
  top: 24,
  duration: 5,
  maxCount: 1,
  getContainer: () => document.body,
});

const AppInfoView = () => {
  const {
    loading,
    error,
    displayMessage,
    notification: notificationData,
  } = useInfoViewContext();
  const { clearInfoView } = useInfoViewActionsContext();

  useEffect(() => {
    if (error) {
      console.log("AppInfoView: Showing error message:", error);
      message.destroy(); // Clear all existing messages
      message.error({
        key: "error-message",
        content: error,
        icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        duration: 4,
        style: { zIndex: 9999 },
      });
      clearInfoView();
    }
  }, [error, clearInfoView]);

  useEffect(() => {
    if (displayMessage) {
      console.log("AppInfoView: Showing success message:", displayMessage);
      message.destroy(); // Clear all existing messages
      message.success({
        key: "success-message",
        content: displayMessage,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        duration: 4,
        style: { zIndex: 9999 },
      });
      // Delay clearing to ensure message is shown
      setTimeout(() => {
        clearInfoView();
      }, 100);
    }
  }, [displayMessage, clearInfoView]);

  useEffect(() => {
    if (notificationData) {
      const { message: msg, type } = notificationData;
      console.log("AppInfoView: Showing notification:", { msg, type });

      const iconMap = {
        success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        error: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        warning: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
        info: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
      };

      notification[type]({
        message: type.charAt(0).toUpperCase() + type.slice(1),
        description: msg,
        icon: iconMap[type],
        duration: 5,
        style: { zIndex: 9999 },
      });

      clearInfoView();
    }
  }, [notificationData, clearInfoView]);

  return <>{loading ? <AppLoader /> : null}</>;
};

export default AppInfoView;
