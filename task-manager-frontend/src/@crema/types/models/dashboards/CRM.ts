export type ProgressGraphDataType = {
  name: string;
  actual: number;
  progress: number;
};

export type QuickStatsDataType = {
  clientsData: ClientsDataType;
  invoiceData: InvoiceDataType;
  totalProjectsData: TotalProjectsDataType;
  openProjectsData: OpenProjectsDataType;
};

export type ClientsDataType = {
  count: string;
};

export type InvoiceDataType = {
  count: string;
};

export type TotalProjectsDataType = {
  count: string;
};

export type OpenProjectsDataType = {
  count: string;
};

export type RevenueDataType = {
  ytdRevenue: string;
  clients: number;
  countries: string;
  clientsColor: string;
  countriesColor: string;
  revenueGraphData: RevenueGraphDataType[];
};

export type RevenueGraphDataType = {
  name: string;
  revenue: number;
  revenue1: number;
};

export type StateDataType = {
  id: number;
  name: string;
  duration: string;
  value: string;
  percentageChange: number;
  iconImg: string;
  color: string;
  hidePercent?: boolean;
  icon?: any;
};

export type VisitorPageViewType = {
  name: string;
  Visitor: number;
  PageView: number;
};

export type OpportunitiesWonGraphDataType = {
  name: string;
  actual: number;
  progress: number;
};

export type TeamStateDataType = {
  id: number;
  name: string;
  duration: string;
  tags: TagType[];
  status: boolean;
  members: MemberType[];
};

export type TagType = {
  id: number;
  color: string;
  title: string;
};

export type MemberType = {
  id: number;
  name: string;
  image: string;
};

export type TopLeaderType = {
  id: string;
  teamLead: TeamLeadType;
  project: string;
  team: TeamType[];
  status: string;
  color: string;
  weeks: string;
  budgets: string;
};

export type TeamLeadType = {
  name: string;
  email: string;
  image: string;
};

export type TeamType = {
  id: number;
  name: string;
  image: string;
};

export type TimesheetType = {
  id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: string;
};

export type RecentActivityType = {
  id: number;
  name: string;
  position: string;
  message: string;
  profile_pic: string;
  created_at: string;
};

export type TodoListType = {
  id: number;
  title: string;
  date: string;
  time_from: string;
  completed: boolean;
};

export type ScreenshotType = {
  id: number;
  title: string;
  type: string;
};

export type DealsTableDataType = {
  id: number;
  name: string;
  progress: string;
  type: string;
  amount: string;
  created: string;
  logo: string;
};

export type TotalVisitorType = {
  name: string;
  value: number;
  color: string;
};

export type EmailMarketingType = {
  id: number;
  value: number;
  name: string;
  fill: string;
};

export type SocialMediaDataType = {
  id: number;
  name: string;
  revenue: number;
  change: any;
  color: string;
  changeColor: string;
};

export type TicketSupportDataType = {
  id: number;
  name: string;
  ticketId: string;
  created: string;
  contact: string;
  image: string;
};

export type CRMType = {
  progressGraphData: ProgressGraphDataType[];
  quickStatsData: QuickStatsDataType;
  revenueData: RevenueDataType;
  stateData: StateDataType[];
  visitorPageView: VisitorPageViewType[];
  opportunitiesWonGraphData: OpportunitiesWonGraphDataType[];
  teamStateData: TeamStateDataType[];
  topLeaders: TopLeaderType[];
  timesheet: TimesheetType[];
  recentActivities: RecentActivityType[];
  todoLists: TodoListType[];
  screenshots: ScreenshotType[];
  dealsTableData: DealsTableDataType[];
  totalVisitors: TotalVisitorType[];
  emailMarketing: EmailMarketingType[];
  socialMediaData: SocialMediaDataType[];
  ticketSupportData: TicketSupportDataType[];
};
