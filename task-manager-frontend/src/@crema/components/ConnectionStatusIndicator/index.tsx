import React from "react";
import { Badge, Tooltip } from "antd";
import {
  WifiOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ConnectionStatus } from "@crema/services/WebSocketService";

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  status,
  className = "",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "green",
          icon: <WifiOutlined />,
          text: "Connected",
          tooltip: "Real-time updates enabled",
        };
      case "connecting":
        return {
          color: "blue",
          icon: <LoadingOutlined spin />,
          text: "Connecting...",
          tooltip: "Connecting to real-time updates",
        };
      case "disconnected":
        return {
          color: "red",
          icon: <DisconnectOutlined />,
          text: "Disconnected",
          tooltip: "Real-time updates disabled",
        };
      case "error":
        return {
          color: "red",
          icon: <ExclamationCircleOutlined />,
          text: "Error",
          tooltip: "Connection error - retrying...",
        };
      default:
        return {
          color: "gray",
          icon: <DisconnectOutlined />,
          text: "Unknown",
          tooltip: "Unknown connection status",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip title={config.tooltip}>
      <Badge
        color={config.color}
        text={
          <span
            className={`connection-status ${className}`}
            style={{ fontSize: "12px" }}
          >
            {config.icon} {config.text}
          </span>
        }
      />
    </Tooltip>
  );
};

export default ConnectionStatusIndicator;
