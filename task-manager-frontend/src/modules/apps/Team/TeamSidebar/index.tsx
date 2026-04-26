import React, { useEffect } from "react";
import AppScrollbar from "@crema/components/AppScrollbar";
import { Card, Select, Spin } from "antd";
import { StyledTeamSidebar } from "./index.styled";
import { useGetDataApi } from "@crema/hooks/APIHooks";
import type { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";
import IntlMessages from "@crema/helpers/IntlMessages";

const { Option } = Select;

interface TeamSidebarProps {
  selectedBoardId?: number;
  onBoardSelect: (boardId: number, boardName: string) => void;
}

const TeamSidebar: React.FC<TeamSidebarProps> = ({
  selectedBoardId,
  onBoardSelect,
}) => {
  const [{ apiData: boardList, loading }] = useGetDataApi<BoardObjType[]>(
    "/scrumboard/board/list",
    []
  );

  // Auto-select first board on load
  useEffect(() => {
    if (boardList && boardList.length > 0 && !selectedBoardId) {
      onBoardSelect(boardList[0].id, boardList[0].name);
    }
  }, [boardList, selectedBoardId, onBoardSelect]);

  const handleBoardChange = (boardId: number) => {
    const board = boardList?.find((b) => b.id === boardId);
    if (board) {
      onBoardSelect(boardId, board.name);
    }
  };

  return (
    <StyledTeamSidebar>
      <AppScrollbar>
        <div style={{ padding: "20px" }}>
          <Card title="Select Board" style={{ marginBottom: 20 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="small" />
                <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                  Loading boards...
                </div>
              </div>
            ) : (
              <Select
                style={{ width: "100%" }}
                placeholder="Select a board"
                value={selectedBoardId}
                onChange={handleBoardChange}
                loading={loading}
              >
                {boardList?.map((board) => (
                  <Option key={board.id} value={board.id}>
                    {board.name}
                  </Option>
                ))}
              </Select>
            )}
          </Card>
        </div>
      </AppScrollbar>
    </StyledTeamSidebar>
  );
};

export default TeamSidebar;
