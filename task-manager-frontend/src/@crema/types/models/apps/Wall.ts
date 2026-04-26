import {MessageType} from './Chat';

export type FriendRequestObjType = {
  id: number;
  profilePic: string;
  name: string;
  date: any;
};

export type ImageObjType = {
  id: number;
  thumb: string;
};

export type RecentNewsObjType = {
  id: number;
  user: {
    name: string;
    profilePic: string;
  };
  title: string;
  desc: string;
};

export type WhoToFollowObjType = {
  id: number;
  title: string;
  subTitle: string;
  profilePic: string;
};

export type SuggestionObjType = {
  id: number;
  name: string;
  desc: string;
  thumb: string;
};

export type MediaObjType = {
  id: number | string;
  url: string;
  mime_type: string;
};

export type AttachmentObjType = {
  id: number;
  path: string;
  preview: string;
  metaData: {
    type: string;
    size: number;
  };
};

export type CommentObjType = {
  id?: number;
  author: {
    name: string;
    profilePic: string;
    id: number;
  };
  liked?: boolean;
  comment: string;
  message_type: MessageType;
  date?: any;
  media?: MediaObjType;
};

export type AbutDataType = {
  id: number;
  icon: string;
  text: string;
  linkType: string;
};

export type SuggestTeamDataType = {
  icon: string;
  title: string;
  subTitle: string;
  mediaImg: string;
};

export type StoriesDataType = {
  id: number;
  avatar: string;
  title: string;
  imgSrc: string;
};

export type WhatsHappenDataType = {
  id: number;
  imgSrc: string;
  title: string;
  subTitle: string;
  tag: TagType[];
};

export type TagType = {
  id: number;
  name?: string;
};

export type WallDataType = {
  id: number;
  name: string;
  profilePic: string;
  videoCall: {
    users: {
      id: number;
      name: string;
      profilePic: string;
    }[];
    title: string;
  };
  whatsHappen: WhatsHappenDataType[];
  suggestTeam: SuggestTeamDataType;
  stories: StoriesDataType[];
  about: AbutDataType[];
  friendRequests: FriendRequestObjType[];
  photos: ImageObjType[];
  recentNews: RecentNewsObjType[];
  whoToFollow: WhoToFollowObjType[];
  suggestions: SuggestionObjType[];
};

export type UserObjType = {
  name: string;
  profilePic: string;
  id: number;
};

export type PostObjType = {
  id: number;
  owner: UserObjType;
  date: any;
  attachments: AttachmentObjType[];
  message?: string;
  liked: boolean;
  likes: number;
  shares: number;
  views: number;
  comments: CommentObjType[];
  content?: string;
};
