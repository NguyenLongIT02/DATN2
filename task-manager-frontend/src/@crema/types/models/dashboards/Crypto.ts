export type CoinGraphDataType = {
  bitcoin: {
    yearlyData: {month: string; amount: number}[];
    monthlyData: {date: string; amount: number}[];
    weeklyData: {day: string; amount: number}[];
    dailyData: {time: string; amount: number}[];
  };
  litecoin: {
    yearlyData: {month: string; amount: number}[];
    monthlyData: {date: string; amount: number}[];
    weeklyData: {day: string; amount: number}[];
    dailyData: {time: string; amount: number}[];
  };
  ripple: {
    yearlyData: {month: string; amount: number}[];
    monthlyData: {date: string; amount: number}[];
    weeklyData: {day: string; amount: number}[];
    dailyData: {time: string; amount: number}[];
  };
};

export type BuySellDataType = {
  value: string;
  price: string;
  amount: string;
};

export type BuySellType = {
  coinList: CoinListType[];
};

export type CoinDataType = {
  price: string;
  increment: number;
};

export type CoinsDataType = {
  bitcoin: CoinDataType;
  etherium: CoinDataType;
  liteCoin: CoinDataType;
  ripple: CoinDataType;
};

export type MarketGraphDataType = {
  month: string;
  medium: number;
  low: number;
  high: number;
  amt: number;
};

export type NewsDataType = {
  id: number;
  news: string;
  created: string;
  image: string;
  by: string;
};

export type PopularCoinsDataType = {
  id: number;
  name: string;
  shortName: string;
  marketCap: string;
  volume: string;
  image: string;
  color: string;
  h: string;
};

export type BalanceCoinsType = {
  id: number;
  name: string;
  value: number;
};

export type TotalBalanceDataType = {
  balance: string;
  coins: BalanceCoinsType[];
};

export type BtcChartDataType = {
  id: number;
  name: string;
  value: number;
  color: string;
};

export type CoinListType = {
  coinName?: string;
  id: number;
  icon: string;
  name: string;
  shortName: string;
  coinColor: string;
  usdPrice: number;
};

export type StoryType = {
  id: number;
  srcImg: string;
  title: string;
  tag: string;
  time: string;
};

export type OrdersActivityType = {
  id: number;
  transactionID: string;
  type: OrderType[];
  description: string;
  date: string;
  usdAmount: string;
  amount: string;
  name?: string;
};

export type OrderType = {
  id: number;
  icon: string;
  title: string;
};

export type GainerLooserType = {
  id: number;
  icon: string;
  name: string;
  type: string;
  percentage: string;
  amount: string;
};

export type AtcStaticType = {
  name: string;
  Buy: number;
  Sell: number;
};

export type CardDetailsType = {
  cardDetail: CardDetailType[];
  monthlyLimit: MonthlyLimitType[];
};

export type CardDetailType = {
  id: number;
  title: string;
  name: string;
};

export type MonthlyLimitType = {
  id: number;
  value: number;
  activeColor: string;
  title: string;
  income: string;
};

export type QuickTransferType = {
  recentContact: RecentContactType[];
  coinList: CoinList2Type[];
};

export type RecentContactType = {
  id: number;
  image: string;
  name: string;
};

export type CoinList2Type = {
  id: number;
  icon: string;
  value: number;
  shortName: string;
  name?: string;
};

export type CryptoType = {
  stories: StoryType[];
  ordersActivities: OrdersActivityType[];
  gainerLooser: GainerLooserType[];
  atcStatics: AtcStaticType[];
  cardDetails: CardDetailsType;
  quickTransfer: QuickTransferType;
  buySell: BuySellType;
  coinsData: CoinsDataType;
  popularCoins: PopularCoinsDataType[];
  totalBalanceData: TotalBalanceDataType;
};
