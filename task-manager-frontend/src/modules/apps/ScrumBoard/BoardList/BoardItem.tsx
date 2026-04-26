import React from "react";
import { BsCardList } from "react-icons/bs";
import { MdEdit, MdDelete } from "react-icons/md";
import {
  StyledScrumBoardCard,
  StyledScrumBoardCardText,
  StyledScrumListIcon,
  StyledScrumBoardCardDate,
} from "./index.styled";
import { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

type BoardItemProps = {
  board: BoardObjType;
  onEditButtonClick: (board: BoardObjType) => void;
  onDeleteButtonClick: (board: BoardObjType) => void;
  onViewBoardDetail: (board: BoardObjType) => void;
};

const BoardItem: React.FC<BoardItemProps> = ({
  board,
  onEditButtonClick,
  onDeleteButtonClick,
  onViewBoardDetail,
}) => {
  return (
    <StyledScrumBoardCard
      key={board.id}
      onClick={() => onViewBoardDetail(board)}
    >
      <StyledScrumListIcon>
        <BsCardList />
        <MdEdit
          onClick={(e) => {
            e.stopPropagation();
            onEditButtonClick(board);
          }}
          title="Edit Board"
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        />
        <MdDelete
          onClick={(e) => {
            e.stopPropagation();
            onDeleteButtonClick(board);
          }}
          title="Delete Board"
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        />
      </StyledScrumListIcon>
      <StyledScrumBoardCardText>{board.name}</StyledScrumBoardCardText>
      {(board.startDate || board.endDate) && (
        <StyledScrumBoardCardDate>
          {board.startDate && <div style={{ color: "white" }}>Bắt đầu: {new Date(board.startDate).toLocaleDateString("vi-VN")}</div>}
          {board.endDate && <div style={{ color: "white" }}>Kết thúc: {new Date(board.endDate).toLocaleDateString("vi-VN")}</div>}
        </StyledScrumBoardCardDate>
      )}
      <span onClick={(event) => event.stopPropagation()} />
    </StyledScrumBoardCard>
  );
};

export default BoardItem;
