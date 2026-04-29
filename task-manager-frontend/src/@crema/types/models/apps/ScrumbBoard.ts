/* eslint-disable @typescript-eslint/no-explicit-any */
export type LabelObjType = {
  id: number;
  name: string;
  type: number;
  color: string;
};

export type MemberObjType = {
  id: number;
  name: string;
  email?: string;
  avatar?: string;
  image?: string; // For backward compatibility
  role?: string; // Optional để backward compatibility
  joinedAt?: string;
  lastActive?: string;
  boards?: number;
  tasks?: number;
};

export type CheckedListObjType = {
  id: number;
  title: string;
  checked?: boolean; // For backward compatibility
};

export type AttachmentObjType = {
  id: number;
  file: {
    path: string;
    name: string;
    lastModified: number;
    lastModifiedDate: string;
    size?: number; // For backward compatibility
  };
  preview: string;
};

export type CardObjType = {
  id: number;
  title: string;
  attachments: AttachmentObjType[];
  label: LabelObjType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any;
  comments: any[];
  desc: string;
  members: MemberObjType[];
  checkedList: CheckedListObjType[];
  laneId?: number; // Added for react-trello compatibility
  status?: string; // Workflow status from list.statusType (TODO, IN_PROGRESS, DONE, NONE)
  dependencies?: number[]; // List of predecessor card IDs (TODO: backend needs to add this)
};

export type CardListObjType = {
  id: number;
  name: string;
  cards: CardObjType[];
  statusType?: string; // Workflow type: TODO, IN_PROGRESS, DONE, NONE
};

export type BoardObjType = {
  id: number;
  name: string;
  startDate?: string;
  endDate?: string;
  list: CardListObjType[];
  userRole?: string;
  description?: string; // For backward compatibility
  color?: string; // For backward compatibility
  members?: MemberObjType[]; // For backward compatibility
};

export type AiPriorityItem = {
  cardId: number;
  cardTitle: string;
  listName: string;
  score: number;
  reason: string;
  dueDate?: string | null;
  assigneeCount?: number;
};

export type AiRiskItem = {
  cardId: number;
  cardTitle: string;
  listName: string;
  score: number;
  severity: string;
  reason: string;
};

export type AiAssignmentItem = {
  cardId: number;
  cardTitle: string;
  listName: string;
  suggestedUserId: number;
  suggestedUserName: string;
  currentLoad: number;
  reason: string;
};

export type AiBoardSuggestionDto = {
  boardName: string;
  aiConfigured: boolean;
  aiUsed: boolean;
  provider: string;
  model: string;
  generatedAt: string;
  summary: string;
  nextActions: string[];
  fallbackReason?: string | null;
  priorities: AiPriorityItem[];
  risks: AiRiskItem[];
  assignments: AiAssignmentItem[];
};

export type AiChatRole = "user" | "assistant";

export type AiBoardChatMessageDto = {
  role: AiChatRole;
  content: string;
};

export type AiBoardChatRequestDto = {
  question: string;
  history?: AiBoardChatMessageDto[];
};

export type AiBoardChatResponseDto = {
  boardName: string;
  aiConfigured: boolean;
  aiUsed: boolean;
  provider: string;
  model: string;
  generatedAt: string;
  answer: string;
  fallbackReason?: string | null;
  referencedCardIds: number[];
  referencedUserIds: number[];
  referencedListNames: string[];
};
