import React, { useState, useEffect } from "react";

import IntlMessages from "@crema/helpers/IntlMessages";
import { Input, message } from "antd";
import { useIntl } from "react-intl";
import {
  StyledScrumAddBoardCard,
  StyledScrumAddBoardFooterBtn,
  StyledScrumBoardAddModal,
} from "./index.styled";
import { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

type AddNewBoardProps = {
  isModalVisible: boolean;
  handleCancel: () => void;
  handleOk: () => void;
  onAddBoard: (boardName: string, startDate?: string, endDate?: string) => void;
  selectedBoard: BoardObjType | null;
};

// Helper function to convert ISO string to yyyy-MM-dd format for input[type="date"]
const formatDateForInput = (isoString: string | undefined): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

const AddNewBoard: React.FC<AddNewBoardProps> = ({
  isModalVisible,
  handleCancel,
  handleOk,
  onAddBoard,
  selectedBoard,
}) => {
  const [boardName, setBoardName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Update form when selectedBoard changes
  useEffect(() => {
    if (selectedBoard) {
      setBoardName(selectedBoard.name || "");
      setStartDate(formatDateForInput(selectedBoard.startDate));
      setEndDate(formatDateForInput(selectedBoard.endDate));
    } else {
      setBoardName("");
      setStartDate("");
      setEndDate("");
    }
  }, [selectedBoard, isModalVisible]);

  const onClickAddButton = () => {
    if (boardName === "") {
      message.error("Vui lòng nhập tên bảng");
      return;
    }

    // Validate dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        message.error("Ngày bắt đầu phải trước ngày kết thúc");
        return;
      }
    }

    onAddBoard(boardName, startDate, endDate);
    setBoardName("");
    setStartDate("");
    setEndDate("");
  };
  const { messages } = useIntl();

  return (
    <StyledScrumBoardAddModal
      title={messages["scrumboard.addNewBoard"] as string}
      open={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={
        <StyledScrumAddBoardFooterBtn type="primary" onClick={onClickAddButton}>
          <IntlMessages id="common.add" />
        </StyledScrumAddBoardFooterBtn>
      }
    >
      <StyledScrumAddBoardCard>
        <Input
          placeholder={messages["scrumboard.boardTitle"] as string}
          value={boardName}
          onChange={(event) => setBoardName(event.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: "14px", color: "#595959" }}>
            <IntlMessages id="scrumboard.startDate" />
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4, fontSize: "14px", color: "#595959" }}>
            <IntlMessages id="scrumboard.endDate" />
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </StyledScrumAddBoardCard>
    </StyledScrumBoardAddModal>
  );
};

export default AddNewBoard;
