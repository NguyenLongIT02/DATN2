export type WelcomeCardDataType = {
  id: number;
  type: string;
  counts: number;
  icon: string;
};

export type RevenueCardsType = {
  id: number;
  type: string;
  value: string;
  growth: number;
  icon: string;
  strokeColor: string;
  graphData: {month: string; number: number}[];
};

export type SalesStateDataType = {
  id: number;
  amount: string;
  type: string;
  icon: string;
};

export type ChartDataType = {
  name: string;
  AS: number;
  Rev: number;
  amt: number;
};

export type VisitorsPageViewType = {
  name: string;
  Page: number;
  Visitor: number;
};

export type ActiveVisitorsType = {
  growth: number;
  value: number;
  slug: string;
  graphData: {time: string; value: number}[];
};

export type TopSellingProductType = {
  id: number;
  icon: string;
  name: string;
  description: string;
  price: number;
  rate: number;
  color: string;
};

export type EarningDataType = {
  id: number;
  color: string;
  amount: number;
  country: string;
};

export type TicketsType = {
  id: number;
  name: string;
  opened: number;
  overAllPercentage: {
    open: number;
    close: number;
    hold: number;
  };
};

export type PageVisitType = {
  id: number;
  page: string;
  pageView: number;
  visitors: number;
};

export type TransactionDataType = {
  id: string;
  customer: string;
  date: string;
  paymentType: string;
  status: string;
};

export type InfoWidgetsType = {
  id: number;
  icon: string;
  count: number | string;
  details: string;
  bgColor?: string;
};

export type TrafficDataType = {
  id: number;
  title: string;
  value: number;
  session: number;
};

export type AnalyticsType = {
  welcomeCard: WelcomeCardDataType[];
  revenueCards: RevenueCardsType[];
  salesState: SalesStateDataType[];
  saleChartData: ChartDataType[];
  visitorsPageView: VisitorsPageViewType[];
  activeVisitors: ActiveVisitorsType;
  topSellingProduct: TopSellingProductType[];
  earningData: EarningDataType[];
  tickets: TicketsType[];
  pageVisits: PageVisitType[];
  transactionData: TransactionDataType[];
  infoWidgets: InfoWidgetsType[];
  trafficData: TrafficDataType[];
};
