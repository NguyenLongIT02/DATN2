import React from "react";
import dayjs from "dayjs";
import Members from "./Members";
import Labels from "./Labels";
import { MdChatBubbleOutline, MdCheckBox } from "react-icons/md";
import {
  StyledScrumBoardCardDetails,
  StyledScrumBoardCardDetailTitle,
  StyledScrumBoardCardDetailUser,
  StyledScrumBoardCardHeader,
  StyledScrumBoardCardHeaderAction,
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
  // When used with react-trello, it may pass all card data as spread props
  [key: string]: any;
};

const BoardCard: React.FC<CardDetailProps> = (props) => {
  // Extract props with fallbacks
  // react-trello may pass the card data in different ways
  const {
    title = "",
    attachments = [],
    label = [],
    labels = [], // Alternative prop name
    members = [],
    userList = [], // Alternative prop name
    date = "",
    dueDate = "", // Alternative prop name
    comments = [],
    commentList = [], // Alternative prop name
    checkedList = [],
    onClick,
  } = props;

  // Ensure arrays are valid before using .length
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
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
  const displayDate = date || dueDate || "";

  return (
    <StyledScrumBoardCardDetails
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
      </StyledScrumBoardCardHeader>
      {safeLabel.length > 0 ? <Labels labels={safeLabel} /> : null}

      <StyledScrumBoardCardDetailUser>
        {safeMembers.length > 0 ? <Members members={safeMembers} /> : null}

        <StyledScrumBoardCardDetailDate>
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
