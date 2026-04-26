import React, { useState, useEffect } from "react";
import { Drawer, List, Typography, Avatar, Tooltip } from "antd";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import IntlMessages from "@crema/helpers/IntlMessages";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

type ActivityLogDrawerProps = {
  boardId: number;
  isOpen: boolean;
  onClose: () => void;
};

const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({ boardId, isOpen, onClose }) => {
  const [{ apiData: logs, loading }, { setQueryParams }] = useGetDataApi<any[]>(
    `/scrumboard/activity/board/${boardId}`,
    [],
    {},
    false
  );

  useEffect(() => {
    if (isOpen) {
      setQueryParams({}); // trigger re-fetch when opening
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const renderLogAction = (log: any) => {
    let color = "#108ee9";
    if (log.actionType.includes("DELETE")) color = "#f50";
    if (log.actionType.includes("CREATE")) color = "#87d068";
    if (log.actionType.includes("UPDATE")) color = "#faad14";
    if (log.actionType.includes("MOVE")) color = "#722ed1";
    if (log.actionType.includes("COMMENT")) color = "#13c2c2";

    return <Text style={{ color }}>{log.description}</Text>;
  };

  return (
    <Drawer
      title={<IntlMessages id="scrumboard.activityLog" defaultMessage="Activity Log" />}
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
    >
      <List
        loading={loading}
        dataSource={logs?.data || logs || []}
        renderItem={(log: any) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                log.userAvatar ? (
                  <Avatar src={log.userAvatar} />
                ) : (
                  <Avatar>{log.userFullName?.charAt(0) || log.username?.charAt(0) || "U"}</Avatar>
                )
              }
              title={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text strong>{log.userFullName || log.username}</Text>
                  <Tooltip title={dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(log.createdAt).fromNow()}
                    </Text>
                  </Tooltip>
                </div>
              }
              description={renderLogAction(log)}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default ActivityLogDrawer;
