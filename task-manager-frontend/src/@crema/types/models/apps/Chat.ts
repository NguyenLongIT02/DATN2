export enum MessageType {
  MEDIA = 1,
  TEXT = 2,
}

export type MemberType = {
  id: number;
  name: string;
  image: string;
  status: string;
  username?: string;
};

export type ConnectionObjType = {
  id: number;
  channelId: number;
  name: string;
  image: string;
  photoURL?: string;
  email?: string;
  status: string;
  username: string;
  displayName?: string;
  isGroup?: boolean;
  members?: MemberType[];
  lastMessage?: {
    id: number;
    message: string;
    type: string;
    time: string;
  };
};

export type MediaObjType = {
  id: string | number;
  url: string;
  mime_type: string;
  file_name: string;
  file_size?: number;
};

export type MessageDataObjType = {
  id?: number;
  sender?: number | string;
  message?: string;
  message_type: MessageType;
  time?: string;
  edited?: boolean;
  media?: MediaObjType[];
};

export type MessageObjType = {
  channelId: number;
  messageData: MessageDataObjType[];
};

export type ChatApiResponseType = {
  userMessages: MessageObjType | null;
  connectionData: MessageDataObjType;
};
