import React, { useState, useEffect } from "react";
import AppScrollbar from "@crema/components/AppScrollbar";
import IntlMessages from "@crema/helpers/IntlMessages";
import { Badge } from "antd";
import { StyledNotificationSidebar, StyledFilterItem } from "./index.styled";
import { useNotificationContext } from "../index";
import type { Notification } from "@crema/mockapi/apis/notifications/NotificationService";

interface NotificationSidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { notifications } = useNotificationContext();

  // Calculate filter counts
  const getFilterCounts = () => {
    if (!Array.isArray(notifications))
      return {
        all: 0,
        unread: 0,
        mentions: 0,
        assigned: 0,
        comments: 0,
        due_dates: 0,
      };

    const all = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const mentions = notifications.filter(
      (n) => n.type === "member_assigned" || n.type === "member_removed"
    ).length;
    const assigned = notifications.filter(
      (n) => n.type === "member_assigned"
    ).length;
    const comments = notifications.filter(
      (n) => n.type === "card_updated"
    ).length;
    const due_dates = notifications.filter(
      (n) => n.type === "card_created" || n.type === "card_moved"
    ).length;

    return { all, unread, mentions, assigned, comments, due_dates };
  };

  const filterCounts = getFilterCounts();

  const filters = [
    { id: "all", labelKey: "notifications.all", count: filterCounts.all },
    {
      id: "unread",
      labelKey: "notifications.unread",
      count: filterCounts.unread,
    },
    {
      id: "mentions",
      labelKey: "notifications.mentions",
      count: filterCounts.mentions,
    },
    {
      id: "assigned",
      labelKey: "notifications.assigned",
      count: filterCounts.assigned,
    },
    {
      id: "comments",
      labelKey: "notifications.comments",
      count: filterCounts.comments,
    },
    {
      id: "due_dates",
      labelKey: "notifications.dueDates",
      count: filterCounts.due_dates,
    },
  ];

  return (
    <StyledNotificationSidebar>
      <AppScrollbar>
        <div style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: 16 }}>
            <IntlMessages id="common.filters" />
          </h3>
          {filters.map((filter) => (
            <StyledFilterItem
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              style={{
                cursor: "pointer",
                backgroundColor:
                  activeFilter === filter.id ? "#e6f7ff" : "transparent",
                border:
                  activeFilter === filter.id
                    ? "1px solid #1890ff"
                    : "1px solid transparent",
                borderRadius: "4px",
                padding: "8px 12px",
                marginBottom: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <span>
                <IntlMessages id={filter.labelKey} />
              </span>
              <Badge count={filter.count} />
            </StyledFilterItem>
          ))}
        </div>
      </AppScrollbar>
    </StyledNotificationSidebar>
  );
};

export default NotificationSidebar;
