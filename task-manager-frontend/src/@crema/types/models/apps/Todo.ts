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
  label: string;
  value: string;
  color: string;
};

export type PriorityObjType = {
  id: number;
  name: string;
  type: number;
  color: string;
};

export type StaffObjType = {
  id: number;
  name: string;
  image: string;
};

export type StatusObjType = {
  id: number;
  name: string;
  type: number;
};

export type CommentObjType = {
  comment: string;
  name: string;
  image: string;
  date: string;
  time?: string;
};

export type TodoObjType = {
  id: number;
  title: string;
  isStarred?: boolean;
  label: LabelObjType[];
  priority: PriorityObjType;
  isAttachment: boolean;
  sentAt: string;
  folderValue: number;
  scheduleMobile: string;
  image: string;
  assignedTo: StaffObjType;
  createdBy: {
    name: string;
    image?: string;
  };
  createdOn: string;
  startDate: string;
  endDate?: string;
  status: number;
  comments: CommentObjType[];
  content: string;
  isReplied?: boolean;
  isRead?: boolean;
  date?: string;
};
