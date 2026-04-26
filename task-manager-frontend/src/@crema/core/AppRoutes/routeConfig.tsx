/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MdOutlineAnalytics,
  MdOutlineDns,
  MdNotifications,
  MdPeople,
  MdAssessment,
  MdAutoMode,
} from "react-icons/md";
import { RoutePermittedRole } from "@crema/constants/AppEnums";

const routesConfig = [
  // {
  //   id: "dashboards",
  //   title: "Application",
  //   messageId: "sidebar.application",
  //   type: "group",
  //   children: [
  //     {
  //       id: "analytics",
  //       title: "Analytics",
  //       permittedRole: RoutePermittedRole.User,
  //       messageId: "sidebar.app.dashboard.analytics",
  //       icon: <MdOutlineAnalytics />,
  //       url: "/dashboards/analytics",
  //     },
  //     {
  //       id: "reports",
  //       title: "Reports",
  //       messageId: "sidebar.apps.reports",
  //       icon: <MdAssessment />,
  //       url: "/dashboards/reports",
  //     },
  //   ],
  // },
  {
    id: "collaboration",
    title: "Collaboration",
    messageId: "sidebar.collaboration",
    type: "group",
    children: [
      {
        id: "scrum-board",
        title: "Kanban Board",
        messageId: "sidebar.apps.scrumboard",
        icon: <MdOutlineDns />,
        url: "/collaboration/kanban-board",
      },
      {
        id: "team",
        title: "Team",
        messageId: "sidebar.apps.team",
        icon: <MdPeople />,
        url: "/collaboration/team",
      },
      {
        id: "notifications",
        title: "Notifications",
        messageId: "sidebar.apps.notifications",
        icon: <MdNotifications />,
        url: "/collaboration/notifications",
      },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    messageId: "sidebar.settings",
    type: "group",
    children: [
      {
        id: "automation",
        title: "Automation",
        messageId: "sidebar.apps.automation",
        icon: <MdAutoMode />,
        url: "/apps/automation",
      },
    ],
  },
];
export default routesConfig;
