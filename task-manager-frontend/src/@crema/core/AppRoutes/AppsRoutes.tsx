/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { Navigate } from "react-router-dom";

const ScrumBoard = React.lazy(() => import("../../../modules/apps/ScrumBoard"));
const Notifications = React.lazy(
  () => import("../../../modules/apps/Notifications")
);
const Team = React.lazy(() => import("../../../modules/apps/Team"));
const Reports = React.lazy(() => import("../../../modules/apps/Reports"));
const Automation = React.lazy(() => import("../../../modules/apps/Automation"));

export const appsConfig = [
  {
    path: "/apps/mail",
    element: <Navigate to="/apps/mail/folder/inbox" />,
  },
  {
    path: "/apps/contact",
    element: <Navigate to="/apps/contact/folder/all" />,
  },
  {
    path: [
      "/collaboration/kanban-board/:id",
      "/collaboration/kanban-board",
      "/collaboration/scrum-board/:id",
      "/collaboration/scrum-board",
    ],
    element: <ScrumBoard />,
  },
  {
    path: ["/collaboration/notifications"],
    element: <Notifications />,
  },
  {
    path: ["/collaboration/team"],
    element: <Team />,
  },
  {
    path: ["/dashboards/reports"],
    element: <Reports />,
  },
  {
    path: ["/apps/automation"],
    element: <Automation />,
  },
];
