export type ConnectionObjType = {
  id: number;
  name: string;
  status: string;
  image: string;
  email: string;
  address: string;
  designation: string;
};

export type FolderObjType = {
  id: number;
  name: string;
  alias: string;
  icon?: string;
};

export type LabelObjType = {
  id: number;
  name: string;
  alias: string;
  color: string;
  icon?: any;
};

export type SenderType = {
  id: number;
  name: string;
  email: string;
  profilePic: string;
};

export type MessageType = {
  messageId: number | string;
  description: string;
  sender: SenderType;
  to: SenderType[];
  cc: any[];
  bcc: any[];
  isStarred: boolean;
  sentOn: string;
};

export type MailObjType = {
  id: number;
  isChecked?: boolean;
  isStarred?: boolean;
  isReplied?: boolean;
  label: LabelObjType;
  sentBy?: string;
  subject: string;
  hasAttachments: boolean;
  sentAt?: string;
  messages?: MessageType[];
  isRead?: boolean;
  folderValue: number;
};
