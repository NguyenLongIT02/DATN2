import React from "react";
import { RoutePermittedRole } from "@crema/constants/AppEnums";

const HealthCare = React.lazy(
  () => import("../../../modules/dashboards/HealthCare")
);
const Academy = React.lazy(() => import("../../../modules/dashboards/Academy"));

export const dashboardConfig = [
  {
    permittedRole: RoutePermittedRole.User,
    path: "/",
    element: <HealthCare />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: "/dashboards/analytics",
    element: <HealthCare />,
  },

  {
    permittedRole: RoutePermittedRole.User,
    path: "/dashboards/academy",
    element: <Academy />,
  },
];
