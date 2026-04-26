import React, { useState } from "react";
import { Progress, Button, Input, Space } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { postDataApi, putDataApi, deleteDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { CheckedListObjType } from "@crema/types/models/apps/ScrumbBoard";
import {
  StyledScrumBoardCardCheckList,
  StyledScrumBoardCardCheckListHeader,
  StyledScrumBoardCardCheckListItem,
  StyledScrumBoardCheckbox,
  StyledScrumBoardInput,
} from "./index.styled";

interface CardCheckedListProps {
  cardId: number;
  checkedList: CheckedListObjType[];
  setCheckedList: (list: CheckedListObjType[]) => void;
}

const CardCheckedList: React.FC<CardCheckedListProps> = ({
  cardId,
  checkedList,
  setCheckedList,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const safeList = Array.isArray(checkedList) ? checkedList : [];
  const totalItems = safeList.length;
  const completedItems = safeList.filter((item) => item.checked).length;
  const progress =
    totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const handleToggle = (itemId: number) => {
    if (cardId === 0) {
      const newList = safeList.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      setCheckedList(newList);
      return;
    }

    putDataApi(
      `/scrumboard/checklist/${itemId}/toggle`,
      infoViewActionsContext,
      {},
      true
    ).then(() => {
      const newList = safeList.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      setCheckedList(newList);
    });
  };

  const handleAdd = () => {
    if (!newItemTitle.trim()) return;

    if (cardId === 0) {
      const newItem: CheckedListObjType = {
        id: Date.now(),
        title: newItemTitle,
        checked: false,
      };
      setCheckedList([...safeList, newItem]);
      setNewItemTitle("");
      setIsAdding(false);
      return;
    }

    postDataApi<CheckedListObjType>(
      `/scrumboard/checklist/${cardId}?title=${encodeURIComponent(newItemTitle)}`,
      infoViewActionsContext,
      {},
      true
    ).then((newItem) => {
      setCheckedList([...safeList, newItem]);
      setNewItemTitle("");
      setIsAdding(false);
    });
  };

  const handleDelete = (itemId: number) => {
    if (cardId === 0) {
      setCheckedList(safeList.filter((item) => item.id !== itemId));
      return;
    }

    deleteDataApi(
      `/scrumboard/checklist/${itemId}`,
      infoViewActionsContext,
      {},
      true
    ).then(() => {
      setCheckedList(safeList.filter((item) => item.id !== itemId));
    });
  };

  return (
    <StyledScrumBoardCardCheckList>
      {/* Header: Tiêu đề + Thanh tiến trình */}
      <StyledScrumBoardCardCheckListHeader>
        <h4>Danh sách kiểm tra</h4>
        <div style={{ flex: 1, margin: "0 16px" }}>
          <Progress
            percent={progress}
            size="small"
            strokeColor={
              progress === 100
                ? "#52c41a"
                : progress >= 50
                  ? "#1890ff"
                  : "#faad14"
            }
            status={progress === 100 ? "success" : "active"}
            format={(pct) => `${pct}%`}
          />
        </div>
      </StyledScrumBoardCardCheckListHeader>

      {/* Danh sách các mục Checklist */}
      {safeList.map((item) => (
        <StyledScrumBoardCardCheckListItem key={item.id}>
          <StyledScrumBoardCheckbox
            checked={item.checked}
            onChange={() => handleToggle(item.id)}
          >
            <span
              style={{
                textDecoration: item.checked ? "line-through" : "none",
                color: item.checked ? "#bfbfbf" : "inherit",
              }}
            >
              {item.title}
            </span>
          </StyledScrumBoardCheckbox>
          <Button
            className="icon-btn"
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(item.id)}
          />
        </StyledScrumBoardCardCheckListItem>
      ))}

      {/* Form thêm mục mới */}
      {isAdding ? (
        <div style={{ marginTop: 8 }}>
          <StyledScrumBoardInput
            autoFocus
            placeholder="Thêm mục mới"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onPressEnter={handleAdd}
            style={{ marginBottom: 8 }}
          />
          <Space>
            <Button type="primary" size="small" onClick={handleAdd}>
              Thêm
            </Button>
            <Button size="small" onClick={() => setIsAdding(false)}>
              Hủy
            </Button>
          </Space>
        </div>
      ) : (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          size="small"
          onClick={() => setIsAdding(true)}
          style={{ marginTop: 4 }}
        >
          Thêm mục mới
        </Button>
      )}
    </StyledScrumBoardCardCheckList>
  );
};

export default CardCheckedList;
