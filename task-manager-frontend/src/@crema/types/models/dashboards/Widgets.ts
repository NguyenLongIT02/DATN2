export type RecentActivityDataType = {
  id: number;
  image: string;
  name: string;
  message: string;
};

export type CategoriesDataType = {
  id: number;
  name: string;
  isChecked: boolean;
};

export type ProfileDataType = {
  id: number;
  name: string;
  image: string;
  photos: number;
  followers: number;
  following: number;
};

export type MessagesDataType = {
  id: number;
  image: string;
  message: string;
  name: string;
};

export type TaskListDataType = {
  id: number;
  title: string;
  desc: string;
};

export type ColorsListType = {
  id: number;
  name: string;
  color: string;
  isChecked: boolean;
};

export type TagsListType = {
  id: number;
  label: string;
  color: string;
};

export type ReviewsListType = {
  id: number;
  rating: number;
  by: string;
  content: string;
  time: string;
};

export type SocialInfoType = {
  image: string;
  name: string;
  id: string;
  desc: string;
};

export type MateInfoType = {
  facebookInfo: SocialInfoType;
  twitterInfo: SocialInfoType;
};

export type FormatListType = {
  id: number;
  name: string;
};

export type TemperaturesType = {
  id: number;
  day: string;
  image: string;
};

export type CityDataType = {
  id: number;
  name: string;
  desc: string;
  image: string;
};

export type WidgetsType = {
  recentActivity: RecentActivityDataType[];
  categories: CategoriesDataType[];
  profile: ProfileDataType;
  messages: MessagesDataType[];
  taskList: TaskListDataType[];
  colorsList: ColorsListType[];
  tagsList: TagsListType[];
  reviewsList: ReviewsListType[];
  mateInfo: MateInfoType;
  formatList: FormatListType[];
  temperatures: TemperaturesType[];
  cityData: CityDataType[];
};
