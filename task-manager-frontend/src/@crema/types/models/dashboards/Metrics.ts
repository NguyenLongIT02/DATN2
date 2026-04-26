import {ReportCardsType} from './Ecommerce';
import {YourActivityDataType} from './HealthCare';

export type IncomeLastYearType = {
  value: string;
  graphData: {name: string; revenue: number}[];
};

export type WebsiteTrafficDataType = {
  value: string;
  graphData: {name: string; traffic: number}[];
};

export type RevenueGrowthDataType = {
  value: string;
  graphData: {name: string; growth: number}[];
};

export type IncrementActiveUsersType = {
  value: string;
  graphData: {name: string; activeUsers: number}[];
};

export type ExtraRevenueType = {
  value: string;
  graphData: {name: string; revenue: number}[];
};

export type TrafficRaiseType = {
  value: string;
  graphData: {name: string; traffic: number}[];
};

export type LessOrdersType = {
  value: string;
  graphData: {name: string; orders: number}[];
};

export type EarningInMonthDataType = {
  id: number;
  name: string;
  value: number;
  color: string;
  colorName: string;
};

export type SubscriptionDataType = {
  dataOne: {number: number; value: number}[];
  dataTwo: {number: number; value: number}[];
  dataThree: {number: number; value: number}[];
};

export type MetricsLineGraphDataType = {
  value: string;
  difference: string;
  differencePercent: string;
  graphData: {number: string; value: number}[];
};

export type SalesDataType = {
  salesToday: string;
  salesYesterday: string;
  salesGraphData: {
    day: number;
    number: number;
  }[];
};

export type MetricsFloatingChildDataType = {
  value: string;
  change: number;
  strokeColor: string;
  areaColor: string;
  graphData: {
    number: string;
    value: number;
  }[];
};

export type MetricsFloatingGraphDataType = {
  salesData: MetricsFloatingChildDataType;
  clientsData: MetricsFloatingChildDataType;
  revenueData: MetricsFloatingChildDataType;
  newUserData: MetricsFloatingChildDataType;
};

export type VisitsDataType = {
  new: number;
  returning: number;
  graphData: {
    dataOne: {number: string; value: number}[];
    dataTwo: {number: string; value: number}[];
    dataThree: {number: string; value: number}[];
  };
};

export type OrdersDataType = {
  revenue: number;
  orders: number;
  graphData: {
    dataOne: {number: string; value: number}[];
    dataTwo: {number: string; value: number}[];
    dataThree: {number: string; value: number}[];
  };
};

export type ProfileViewsDataType = {
  views: string;
  graphData: {day: number; number: number}[];
};

export type WorkViewsDataType = {
  views: string;
  graphData: {name: string; value: number}[];
};

export type SocialDataType = {
  likes: number;
  comments: number;
};

export type StateGraphDataType = {
  number: number;
  value: number;
};

export type StatsGraphDataType = {
  dataOne: {
    stats1: StateGraphDataType[];
    stats2: StateGraphDataType[];
  };
  dataTwo: {
    stats1: StateGraphDataType[];
    stats2: StateGraphDataType[];
  };
  dataThree: {
    stats1: StateGraphDataType[];
    stats2: StateGraphDataType[];
  };
};

export type SocialVisitorsDataType = {
  id: number;
  name: string;
  visitors: number;
  change: number;
  color: string;
};

export type AccountDataType = {
  name: string;
  complete: number;
  week: number;
};

export type ShareDataType = {
  icon: string;
  color: string;
  value: number;
};

export type MetricStatsType = {
  id: number;
  title: string;
  count: string;
  new: string;
  badgeColor: string;
  bgcolor: string;
  icon: string;
};

export type StateDataType = {
  id: number;
  name: string;
  duration: string;
  value: string;
  percentageChange: number;
  iconImg: string;
  color: string;
};

export type VisitorsPageViewType = {
  name: string;
  Page: number;
  Visitor: number;
};

export type HeartCardType = {
  id: number;
  title: string;
  measurement: string;
  unit: string;
  color: string;
  graphData: {
    rate: number;
    name: string;
  }[];
};

export type MetricsType = {
  ordersThisYear: string;
  queryIcon: string;
  revenueThisYear: string;
  visitsThisYear: string;
  queriesThisYear: string;
  websiteTraffic: string;
  incomeLastYear: IncomeLastYearType;
  websiteTrafficData: WebsiteTrafficDataType;
  revenueGrowthData: RevenueGrowthDataType;
  incrementActiveUsers: IncrementActiveUsersType;
  extraRevenue: ExtraRevenueType;
  trafficRaise: TrafficRaiseType;
  lessOrders: LessOrdersType;
  salesData: SalesDataType;
  earningInMonth: EarningInMonthDataType[];
  subscriptionData: SubscriptionDataType;
  metricsLineGraphData: MetricsLineGraphDataType;
  metricsFloatingGraphData: MetricsFloatingGraphDataType;
  visitsData: VisitsDataType;
  ordersData: OrdersDataType;
  profileViewsData: ProfileViewsDataType;
  workViewsData: WorkViewsDataType;
  socialData: SocialDataType;
  statsGraph: StatsGraphDataType;
  socialVisitorsData: SocialVisitorsDataType[];
  accountData: AccountDataType[];
  shareData: ShareDataType[];
  metricsStats: MetricStatsType[];
  stateData: StateDataType[];
  reportData: ReportCardsType[];
  visitorsPageView: VisitorsPageViewType[];
  heartCard: HeartCardType;
  yourActivity: YourActivityDataType[];
};
