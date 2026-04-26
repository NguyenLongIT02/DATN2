import AreaChart from "../../../modules/thirdParty/recharts/Area";
import BarChart from "../../../modules/thirdParty/recharts/Bar";
import ComposedChart from "../../../modules/thirdParty/recharts/Composed";
import LineChart from "../../../modules/thirdParty/recharts/Line";
import PieChart from "../../../modules/thirdParty/recharts/Pie";
import Radial from "../../../modules/thirdParty/recharts/Radial";
import Treemap from "../../../modules/thirdParty/recharts/Treemap";
import Scatter from "../../../modules/thirdParty/recharts/Scatter";
import Radar from "../../../modules/thirdParty/recharts/Radar";
import FunnelChart from "../../../modules/thirdParty/recharts/Funnel";
import { RoutePermittedRole } from "@crema/constants/AppEnums";

export const rechartsConfigs = [
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/area',
    element: <AreaChart />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/bar',
    element: <BarChart />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/composed',
    element: <ComposedChart />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/line',
    element: <LineChart />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/pie',
    element: <PieChart />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/radar',
    element: <Radar />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/radial',
    element: <Radial />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/treemap',
    element: <Treemap />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/scatter',
    element: <Scatter />,
  },
  {
    permittedRole: RoutePermittedRole.User,
    path: '/third-party/recharts/funnel',
    element: <FunnelChart />,
  },
];
