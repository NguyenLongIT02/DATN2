import React, { useEffect, useState } from "react";
import { Select, Tag, message } from "antd";
import { LinkOutlined, LockOutlined } from "@ant-design/icons";
import { postDataApi, deleteDataApi, useGetDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import type { CardObjType } from "@crema/types/models/apps/ScrumbBoard";

const { Option } = Select;

type CardDependenciesProps = {
  cardId: number | undefined;
  boardId: number;
  currentDependencyIds: number[];
  onDependenciesChange?: (dependencyIds: number[]) => void;
  disabled?: boolean;
};

const CardDependencies: React.FC<CardDependenciesProps> = ({
  cardId,
  boardId,
  currentDependencyIds,
  onDependenciesChange,
  disabled = false,
}) => {
  const [selectedDependencies, setSelectedDependencies] = useState<number[]>(currentDependencyIds || []);
  const [loading, setLoading] = useState(false);
  const infoViewActionsContext = useInfoViewActionsContext();

  // Load all cards in board
  const [{ apiData: boardData }] = useGetDataApi<any>(
    `/scrumboard/board/${boardId}`,
    []
  );

  // Extract all cards from board
  const availableCards: CardObjType[] = React.useMemo(() => {
    if (!boardData) return [];
    
    // Handle SuccessResponse wrapper: boardData might be the BoardDto directly or wrapped
    const board = boardData.list ? boardData : (boardData.data?.list ? boardData.data : null);
    if (!board?.list) return [];
    
    const allCards: CardObjType[] = [];
    board.list.forEach((list: any) => {
      if (Array.isArray(list.cards)) {
        list.cards.forEach((card: any) => {
          // Exclude current card
          if (cardId && card.id === cardId) return;
          allCards.push({
            ...card,
            listName: list.name, // Add list name for display
          } as any);
        });
      }
    });
    return allCards;
  }, [boardData, cardId]);

  useEffect(() => {
    setSelectedDependencies(currentDependencyIds || []);
  }, [currentDependencyIds]);

  const handleDependencyChange = async (newDependencyIds: number[]) => {
    if (!cardId) {
      // Card chưa được tạo, chỉ update local state
      setSelectedDependencies(newDependencyIds);
      if (onDependenciesChange) {
        onDependenciesChange(newDependencyIds);
      }
      return;
    }

    setLoading(true);

    try {
      // Find added and removed dependencies
      const added = newDependencyIds.filter(id => !selectedDependencies.includes(id));
      const removed = selectedDependencies.filter(id => !newDependencyIds.includes(id));

      // Add new dependencies
      if (added.length > 0) {
        await postDataApi(
          `/scrumboard/cards/${cardId}/dependencies`,
          infoViewActionsContext,
          { predecessorIds: added }
        );
      }

      // Remove dependencies
      for (const predecessorId of removed) {
        await deleteDataApi(
          `/scrumboard/cards/${cardId}/dependencies/${predecessorId}`,
          infoViewActionsContext,
          {}
        );
      }

      setSelectedDependencies(newDependencyIds);
      if (onDependenciesChange) {
        onDependenciesChange(newDependencyIds);
      }
      message.success("Cập nhật phụ thuộc thành công");
    } catch (error: any) {
      message.error(error?.message || "Cập nhật phụ thuộc thất bại");
      // Revert on error
      setSelectedDependencies(currentDependencyIds);
    } finally {
      setLoading(false);
    }
  };

  // Check if card is blocked
  const isBlocked = selectedDependencies.length > 0 && selectedDependencies.some(depId => {
    const depCard = availableCards.find(c => c.id === depId);
    return depCard && depCard.status !== "DONE";
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <LinkOutlined />
        <span style={{ fontWeight: 500 }}>Phụ thuộc</span>
        {isBlocked && (
          <Tag icon={<LockOutlined />} color="error">
            Bị chặn
          </Tag>
        )}
      </div>
      
      <Select
        mode="multiple"
        style={{ width: "100%" }}
        placeholder="Chọn các công việc mà thẻ này phụ thuộc vào"
        value={selectedDependencies}
        onChange={handleDependencyChange}
        loading={loading}
        disabled={disabled}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
        }
      >
        {availableCards.map((card) => (
          <Option key={card.id} value={card.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>{card.title}</span>
              {(card as any).listName && (
                <Tag style={{ fontSize: 11 }}>{(card as any).listName}</Tag>
              )}
              {card.status === "DONE" && (
                <Tag color="success" style={{ fontSize: 11 }}>Hoàn thành</Tag>
              )}
            </div>
          </Option>
        ))}
      </Select>

      {isBlocked && (
        <div style={{ marginTop: 8, color: "#ff4d4f", fontSize: 12 }}>
          <LockOutlined /> Thẻ này đang bị chặn bởi các phụ thuộc chưa hoàn thành
        </div>
      )}
    </div>
  );
};

export default CardDependencies;
