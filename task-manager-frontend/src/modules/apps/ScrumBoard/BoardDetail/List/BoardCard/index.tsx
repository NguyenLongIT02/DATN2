import React, { useMemo } from "react";
import { Popover, List, Progress, Typography } from "antd";
const { Text } = Typography;
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
  boardData?: any; // To access the full list of cards for dependencies
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

  const dependentCards = useMemo(() => {
    if (!props.boardData || !props.boardData.lanes || safeDependencies.length === 0) return [];
    
    const allCards = props.boardData.lanes.flatMap((lane: any) => lane.cards || []);
    return allCards.filter((c: any) => safeDependencies.includes(c.id));
  }, [props.boardData, safeDependencies]);

  const popoverContent = (
    <div style={{ width: 300, maxHeight: 300, overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
      <List
        size="small"
        dataSource={dependentCards}
        renderItem={(card: any) => {
          const safeChecklist = Array.isArray(card.checkedList) ? card.checkedList : [];
          const totalItems = safeChecklist.length;
          const completedItems = safeChecklist.filter((item: any) => item.checked).length;
          const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

          return (
            <List.Item>
              <div style={{ width: '100%' }}>
                <Text strong>{card.title ?? card.name}</Text>
                {totalItems > 0 && (
                  <Progress 
                    percent={progress} 
                    size="small" 
                    status={progress === 100 ? "success" : "active"}
                  />
                )}
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  Trạng thái: {card.listStatusType === 'DONE' ? 'Hoàn thành' : card.listStatusType === 'IN_PROGRESS' ? 'Đang thực hiện' : 'Chưa bắt đầu'}
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    </div>
  );

  // Determine card status based on list status and deadline
  const cardStatus = useMemo(() => {
    // Nếu ở cột DONE → xanh lá
    if (listStatusType === 'DONE') {
      return 'completed';
    }
    
    // Nếu ở cột IN_PROGRESS (Đang làm) → vàng
    if (listStatusType === 'IN_PROGRESS') {
      // Nhưng nếu đã quá hạn thì ưu tiên đỏ
      if (displayDate) {
        const now = dayjs();
        const deadline = dayjs(displayDate);
        if (deadline.isBefore(now, 'day')) {
          return 'overdue';
        }
      }
      return 'in-progress';
    }
    
    if (!displayDate) return 'normal';
    
    const now = dayjs();
    const deadline = dayjs(displayDate);
    
    // Quá hạn (đã qua ngày deadline) → đỏ
    if (deadline.isBefore(now, 'day')) {
      return 'overdue';
    }
    
    // Chưa quá hạn → bình thường
    return 'normal';
  }, [displayDate, listStatusType]); // Tính lại khi displayDate hoặc listStatusType thay đổi

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
          <Popover 
            content={popoverContent} 
            title="Chi tiết thẻ phụ thuộc" 
            trigger="click" 
            placement="bottom"
            onOpenChange={(visible) => {
              if (visible && !props.boardData) {
                console.warn("boardData is not provided to BoardCard");
              }
            }}
          >
            <div style={{ 
              fontSize: 11, 
              color: '#ff4d4f', 
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginLeft: 'auto',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
              background: 'rgba(255, 77, 79, 0.1)'
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}>
              <LockOutlined /> Phụ thuộc
            </div>
          </Popover>
        )}
      </StyledScrumBoardCardHeader>
      {safeLabel.length > 0 ? <Labels labels={safeLabel} /> : null}

      <StyledScrumBoardCardDetailUser>
        {safeMembers.length > 0 ? <Members members={safeMembers} /> : null}

        <StyledScrumBoardCardDetailDate 
          $cardStatus={cardStatus}
          style={{
            ...(cardStatus === 'completed' && {
              color: '#52c41a',
              background: 'rgba(82, 196, 26, 0.1)',
              fontWeight: 600
            }),
            ...(cardStatus === 'overdue' && {
              color: '#ff4d4f',
              background: 'rgba(255, 77, 79, 0.1)',
              fontWeight: 600
            }),
            ...(cardStatus === 'in-progress' && {
              color: '#faad14',
              background: 'rgba(250, 173, 20, 0.1)',
              fontWeight: 600
            })
          }}
        >
          {displayDate
            ? dayjs(displayDate).format("DD/MM")
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
