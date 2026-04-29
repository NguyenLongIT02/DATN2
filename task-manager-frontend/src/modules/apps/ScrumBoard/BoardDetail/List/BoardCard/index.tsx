import React, { useMemo } from "react";
import dayjs from "dayjs";
import Members from "./Members";
import Labels from "./Labels";
import { MdChatBubbleOutline, MdCheckBox } from "react-icons/md";
import { LockOutlined } from "@ant-design/icons";
import {
  StyledScrumBoardCardDetails,
  StyledScrumBoardCardDetailTitle,
  StyledScrumBoardCardDetailUser,
  StyledScrumBoardCardHeader,
  StyledScrumBoardCardDetailDate,
  StyledScrumBoardCardDetailComment,
} from "./index.styled";
import {
  LabelObjType,
  MemberObjType,
} from "@crema/types/models/apps/ScrumbBoard";

type CardDetailProps = {
  // react-trello passes individual props OR the whole card object
  // Support both patterns for flexibility
  title?: string;
  attachments?: any[];
  label?: LabelObjType[];
  members?: MemberObjType[];
  date?: string;
  comments?: any[];
  onClick?: () => void;
  listStatusType?: string; // Status of the list (TODO, IN_PROGRESS, DONE, NONE)
  dependencies?: number[]; // Dependency IDs
  // When used with react-trello, it may pass all card data as spread props
  [key: string]: any;
};

const BoardCard: React.FC<CardDetailProps> = (props) => {
  // Extract props with fallbacks
  // react-trello may pass the card data in different ways
  const {
    title = "",
    label = [],
    labels = [], // Alternative prop name
    members = [],
    userList = [], // Alternative prop name
    date = "",
    dueDate = "", // Alternative prop name
    comments = [],
    commentList = [], // Alternative prop name
    checkedList = [],
    dependencies = [],
    dependencyIds = [], // Alternative prop name
    listStatusType = "", // Status of the list
    onClick,
  } = props;

  // Ensure arrays are valid before using .length
  const safeLabel = Array.isArray(label)
    ? label
    : Array.isArray(labels)
      ? labels
      : [];
  const safeMembers = Array.isArray(members)
    ? members
    : Array.isArray(userList)
      ? userList
      : [];
  const safeComments = Array.isArray(comments)
    ? comments
    : Array.isArray(commentList)
      ? commentList
      : [];
  const safeCheckedList = Array.isArray(checkedList) ? checkedList : [];
  const safeDependencies = Array.isArray(dependencies) 
    ? dependencies 
    : Array.isArray(dependencyIds)
      ? dependencyIds
      : [];
  const displayDate = date || dueDate || "";

  // Check if card is blocked (has dependencies and not all are DONE)
  // Note: We can't check dependency status here without all cards data
  // So we just show if it has dependencies
  const hasBlockingDependencies = safeDependencies.length > 0;

  // Determine card status based on deadline - use useMemo to recalculate when date changes
  // If card is in DONE list, don't show overdue/due-soon status
  const cardStatus = useMemo(() => {
    // If in DONE list, always show as normal (completed tasks don't need deadline warnings)
    if (listStatusType === 'DONE') {
      return 'normal';
    }
    
    if (!displayDate) return 'normal';
    
    const now = dayjs();
    const deadline = dayjs(displayDate);
    const daysUntilDeadline = deadline.diff(now, 'day');
    
    // Overdue (past deadline)
    if (daysUntilDeadline < 0) {
      return 'overdue';
    }
    // Due soon (within 3 days)
    else if (daysUntilDeadline <= 3) {
      return 'due-soon';
    }
    // Normal
    return 'normal';
  }, [displayDate, listStatusType]); // Recalculate when displayDate or listStatusType changes

  return (
    <StyledScrumBoardCardDetails
      $cardStatus={cardStatus}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <StyledScrumBoardCardHeader>
        <StyledScrumBoardCardDetailTitle>
          {title}
        </StyledScrumBoardCardDetailTitle>
        {hasBlockingDependencies && (
          <div style={{ 
            fontSize: 11, 
            color: '#ff4d4f', 
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginLeft: 'auto'
          }}>
            <LockOutlined /> Phụ thuộc
          </div>
        )}
      </StyledScrumBoardCardHeader>
      {safeLabel.length > 0 ? <Labels labels={safeLabel} /> : null}

      <StyledScrumBoardCardDetailUser>
        {safeMembers.length > 0 ? <Members members={safeMembers} /> : null}

        <StyledScrumBoardCardDetailDate $cardStatus={cardStatus}>
          {displayDate
            ? dayjs(displayDate).format("MMM DD").split(",")[0]
            : null}
        </StyledScrumBoardCardDetailDate>
        {safeComments.length > 0 ? (
          <StyledScrumBoardCardDetailComment>
            <span>{safeComments.length}</span>
            <MdChatBubbleOutline />
          </StyledScrumBoardCardDetailComment>
        ) : null}
        {safeCheckedList.length > 0 ? (
          <StyledScrumBoardCardDetailComment 
            style={{ 
              color: safeCheckedList.every(i => i.checked) ? '#52c41a' : 'inherit' 
            }}
          >
            <span>
              {safeCheckedList.filter(i => i.checked).length}/{safeCheckedList.length}
            </span>
            <MdCheckBox />
          </StyledScrumBoardCardDetailComment>
        ) : null}
      </StyledScrumBoardCardDetailUser>
    </StyledScrumBoardCardDetails>
  );
};

export default BoardCard;
