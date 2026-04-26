import React, { useState } from "react";
import { useIntl } from "react-intl";
import { Button, Input } from "antd";
import { FiSend } from "react-icons/fi";
import clsx from "clsx";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledCommentCellWrapper,
  StyledCommentAvatar,
  StyledCommentItemContent,
  StyledCommentItemDate,
  StyledCardCommentArea,
  StyledScrumCardCommentView,
  StyledScrumCardCommentTitle,
  StyledScrumBoardCommentScroll,
  StyledScrumBoardCardComment,
  StyledCardCommentFooter,
} from "./index.styled";

type CardCommentsProps = {
  comments: any[];
  onAddNewComment: (comment: string) => void;
};

const CardComments: React.FC<CardCommentsProps> = ({
  comments,
  onAddNewComment,
}) => {
  const [comment, setComment] = useState("");

  const onAddComment = () => {
    onAddNewComment(comment);
    setComment("");
  };

  const { messages } = useIntl();

  const { TextArea } = Input;

  const getCommentCell = (
    item: any,
    index: number,
    isPreviousSender: boolean
  ) => {
    return (
      <StyledCommentCellWrapper
        className={clsx({
          "scrum-board-card-comment-item-previous": isPreviousSender,
        })}
        key={index}
      >
        {item.userAvatar ? (
          <StyledCommentAvatar
            src={item.userAvatar}
            className="scrum-board-card-comment-item-user-avatar"
          />
        ) : (
          <StyledCommentAvatar className="scrum-board-card-comment-item-user-avatar">
            {item.userFullName ? item.userFullName.charAt(0).toUpperCase() : item.username?.charAt(0).toUpperCase()}
          </StyledCommentAvatar>
        )}
        <StyledCommentItemContent className="scrum-board-card-comment-item-user-content">
          <StyledCommentItemDate className="scrum-board-card-comment-item-user-date">
            {new Date(item.createdAt).toLocaleString()}
          </StyledCommentItemDate>
          <StyledCardCommentArea>
            <p>{item.content}</p>
          </StyledCardCommentArea>
        </StyledCommentItemContent>
      </StyledCommentCellWrapper>
    );
  };

  // Ensure comments is a valid array
  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <StyledScrumCardCommentView>
      <StyledScrumCardCommentTitle>
        <IntlMessages id="common.comments" />
      </StyledScrumCardCommentTitle>
      <StyledScrumBoardCommentScroll>
        {safeComments.length > 0 ? (
          <StyledScrumBoardCardComment>
            {safeComments.map((item, index) => {
              // Validate comment object
              if (!item || !item.content) {
                console.warn("Skipping invalid comment:", item);
                return null;
              }
              return getCommentCell(
                item,
                index,
                index > 0 &&
                  safeComments[index - 1]?.userId === item.userId
              );
            })}
          </StyledScrumBoardCardComment>
        ) : null}
      </StyledScrumBoardCommentScroll>

      <StyledCardCommentFooter>
        <TextArea
          autoSize={{ minRows: 1, maxRows: 2 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onAddComment();
            }
          }}
          value={comment}
          placeholder="Nhấn Enter để bình luận..."
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          shape="circle"
          type="primary"
          disabled={!comment}
          onClick={onAddComment}
        >
          <FiSend />
        </Button>
      </StyledCardCommentFooter>
    </StyledScrumCardCommentView>
  );
};

export default CardComments;
