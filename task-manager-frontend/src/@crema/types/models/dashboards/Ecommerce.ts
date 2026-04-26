export type SalesStateDataType = {
  id: number;
  type: string;
  value: string;
  bgColor: string;
  icon: string;
};

export type ReportCardsType = {
  id: number;
  type: string;
  value: string;
  percentageChange?: number;
  icon: string;
  graphData: {
    month: string;
    number: number;
  }[];
  changes: string;
  color: string;
};

export type PopularProductDataType = {
  id: number;
  icon: string;
  name: string;
  description?: string;
  price: number;
  mrp: number;
};

export type MarketingCampaignDataType = {
  id: number;
  name: string;
  description: string;
  icon: string;
  graph: number;
  growth: boolean;
  spent: string;
  like?: string;
  share?: string;
  duration?: string;
  budget?: string;
};

export type NotificationsDataType = {
  id: number;
  image: string;
  name: string;
  type: string;
  message: string;
};

export type NewCustomersDataType = {
  id: number;
  image: string;
  name: string;
  orders: number;
  color: string;
  message: string;
};

export type SiteVisitorDataType = {
  id: number;
  color: string;
  value: number;
  icon: string;
  country: string;
};

export type BrowserDataType = {
  id: number;
  value: string;
  name: string;
  icon: string;
};

export type RecentOrderDataType = {
  id: string;
  customer: string;
  product: string;
  date: string;
  paymentType: string;
  price: string;
  status: string;
};

export type BestSellerType = {
  profile_pic: string;
  name: string;
  weekDate: string;
  rating: number;
  sales: string;
};

export type StateDataType = {
  id: number;
  icon: string;
  title: string;
  value: number;
  growth: number;
  color: string;
};

export type RevenueItemType = {
  id: number;
  name: string;
  value: number;
};

export type BestSellersType = {
  id: number;
  name: string;
  weekDate: string;
  profile_pic: string;
  sales: string;
  rating: number;
};

export type AgeOfAudienceType = {
  color: string;
  title: string;
  value: number;
  id: number;
};

export type TopInquiriesType = {
  color: string;
  title: string;
  value: number;
  id: number;
};

export type ScheduleType = {
  id: number;
  title: string;
  day: number;
  color: string;
};

export type EcommerceType = {
  stateData: StateDataType[];
  reportData: ReportCardsType[];
  revenueData: RevenueItemType[];
  bestSellers: BestSellersType[];
  audienceData: AgeOfAudienceType[];
  topInquiries: TopInquiriesType[];
  schedules: ScheduleType[];
  popularProducts: PopularProductDataType[];
  marketingCampaign: MarketingCampaignDataType[];
  newCustomers: NewCustomersDataType[];
  siteVisitors: SiteVisitorDataType[];
  browser: BrowserDataType[];
  recentOrders: RecentOrderDataType[];
};
