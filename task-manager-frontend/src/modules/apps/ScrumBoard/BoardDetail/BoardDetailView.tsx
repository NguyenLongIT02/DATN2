/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import AddCard from "./List/AddCard";
import AppsContent from "@crema/components/AppsContainer/AppsContent";
import "./react-trello.d";
import Board from "react-trello";
import { postDataApi, putDataApi, deleteDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import { useThemeContext } from "@crema/context/AppContextProvider/ThemeContextProvider";
import BoardCard from "./List/BoardCard";
import ListHeader from "./List/ListHeader";
import AddCardButton from "./List/AddCardButton";
import AddNewList from "./AddNewList";
import NewListButton from "./NewListButton";
import ConnectionStatusIndicator from "@crema/components/ConnectionStatusIndicator";
import BoardAiAssistantPanel from "./BoardAiAssistantPanel";
import { Button } from "antd";
import {
  isTransitionForbidden,
  requiresDependencyCheck,
  isCardBlocked,
} from "@crema/constants/WorkflowConstants";

import {
  StyledScrumBoardStatusBox,
  StyledScrumBoardTopActions,
  StyledScrumBoardActionBtn,
} from "./index.styled";
import {
  showCardMovedNotification,
  showCardCreatedNotification,
  showListCreatedNotification,
  showListUpdatedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";
import type {
  BoardObjType,
  CardListObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";
import { useWebSocket } from "@crema/hooks/useWebSocket";
import type { WebSocketMessage } from "@crema/services/WebSocketService";

type BoardDetailViewProps = {
  boardDetail: BoardObjType;
  setData: (data: BoardObjType) => void;
};

const BoardDetailView: React.FC<BoardDetailViewProps> = ({
  boardDetail,
  setData,
}) => {
  const [list, setList] = useState<CardListObjType | null>(null);
  const infoViewActionsContext = useInfoViewActionsContext();
  const { theme } = useThemeContext();
  const [isAddCardOpen, setAddCardOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCard, setSelectedCard] = useState<CardObjType | null>(null);

  // ─── Phân quyền theo vai trò ─────────────────────────────────────────────────
  const userRole = boardDetail.userRole;
  const isPM = userRole === "Project Manager";
  const isTeamLead = userRole === "Team Lead";
  const isMember = userRole === "Member";
  const canManageBoard = isPM || isTeamLead; // Có quyền chỉnh sửa board/thẻ
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── WebSocket callbacks (wrapped with useCallback to avoid infinite loops) ─────
  const handleCardCreated = useCallback(
    (message: WebSocketMessage) => {
      if (message.data && message.data.laneId) {
        setData((currentBoard: any) => {
          const updatedBoard = {
            ...currentBoard,
            list: currentBoard.list.map((lane: any) => {
              if (lane.id.toString() === message.data.laneId.toString()) {
                const cardWithLaneId = { ...message.data, laneId: lane.id, listStatusType: lane.statusType };
                const exists = lane.cards.some((c: any) => c.id.toString() === message.data.id?.toString());
                if (exists) {
                  return { ...lane, cards: lane.cards.map((c: any) => c.id.toString() === message.data.id?.toString() ? cardWithLaneId : c) };
                }
                return { ...lane, cards: [...lane.cards, cardWithLaneId] };
              }
              return lane;
            }),
          };
          const targetLane = currentBoard.list.find(
            (l: any) => l.id.toString() === message.data.laneId.toString()
          );
          if (targetLane) {
            showCardCreatedNotification(message.data.title || "Card");
          }
          return updatedBoard;
        });
      }
    },
    [setData]
  );

  const handleCardDeleted = useCallback(
    (message: WebSocketMessage) => {
      const cardIdStr = message.cardId?.toString();
      setData((currentBoard: any) => ({
        ...currentBoard,
        list: currentBoard.list.map((lane: any) => ({
          ...lane,
          cards: lane.cards.filter(
            (card: any) => card.id.toString() !== cardIdStr
          ),
        })),
      }));

      // Close Drawer if current card is deleted
      setSelectedCard((prev) => {
        if (prev && prev.id.toString() === cardIdStr) {
          setAddCardOpen(false);
          infoViewActionsContext.showMessage("Thẻ bạn đang xem đã bị người dùng khác xóa.");
          return null;
        }
        return prev;
      });
    },
    [setData, infoViewActionsContext]
  );

  const handleCardUpdated = useCallback(
    (message: WebSocketMessage) => {
      if (message.data) {
        const cardIdStr = message.cardId?.toString();
        setData((currentBoard: any) => ({
          ...currentBoard,
          list: currentBoard.list.map((lane: any) => ({
            ...lane,
            cards: lane.cards.map((c: any) =>
              c.id.toString() === cardIdStr
                ? { 
                    ...c, 
                    ...message.data,
                    // Preserve dependencies if not included in message
                    dependencies: message.data.dependencies !== undefined 
                      ? message.data.dependencies 
                      : c.dependencies
                  }
                : c
            ),
          })),
        }));

        // Sync with open Drawer
        setSelectedCard((prev) => {
          if (prev && prev.id.toString() === cardIdStr) {
            return { 
              ...prev, 
              ...message.data,
              // Preserve dependencies if not included in message
              dependencies: message.data.dependencies !== undefined 
                ? message.data.dependencies 
                : prev.dependencies
            };
          }
          return prev;
        });
      }
    },
    [setData]
  );

  const handleCardMoved = useCallback(
    (message: WebSocketMessage) => {
      if (message.data && message.fromListId && message.toListId) {
        const cardIdStr = message.cardId?.toString();
        setData((currentBoard: any) => {
          const updatedBoard = {
            ...currentBoard,
            list: currentBoard.list.map((lane: any) => {
              if (lane.id.toString() === message.fromListId?.toString()) {
                return {
                  ...lane,
                  cards: lane.cards.filter(
                    (c: any) => c.id.toString() !== cardIdStr
                  ),
                };
              } else if (lane.id.toString() === message.toListId?.toString()) {
                const cardWithLaneId = { ...message.data, laneId: lane.id, listStatusType: lane.statusType };
                const exists = lane.cards.some((c: any) => c.id.toString() === cardIdStr);
                if (exists) {
                  return { ...lane, cards: lane.cards.map((c: any) => c.id.toString() === cardIdStr ? cardWithLaneId : c) };
                }
                return { ...lane, cards: [...lane.cards, cardWithLaneId] };
              }
              return lane;
            }),
          };
          
          const sourceLane = currentBoard.list.find(
            (l: any) => l.id.toString() === message.fromListId?.toString()
          );
          const targetLane = currentBoard.list.find(
            (l: any) => l.id.toString() === message.toListId?.toString()
          );
          if (sourceLane && targetLane) {
            showCardMovedNotification(
              message.data.title || "Card",
              sourceLane.name || "Source",
              targetLane.name || "Target"
            );
          }
          return updatedBoard;
        });

        // Sync with open Drawer (update lane/list context)
        setSelectedCard((prev) => {
          if (prev && prev.id.toString() === cardIdStr) {
            const targetLane = boardDetail.list.find(l => l.id.toString() === message.toListId?.toString());
            if (targetLane) setList(targetLane);
            return { ...prev, ...message.data, laneId: Number(message.toListId) };
          }
          return prev;
        });
      }
    },
    [setData, boardDetail.list]
  );

  const handleCardCommented = useCallback(
    (message: WebSocketMessage) => {
      if (message.data) {
        setData((currentBoard: any) => {
          const updatedBoard = {
            ...currentBoard,
            list: currentBoard.list.map((lane: any) => ({
              ...lane,
              cards: lane.cards.map((c: any) => {
                if (c.id.toString() === message.cardId) {
                  const safeComments = Array.isArray(c.comments)
                    ? c.comments
                    : [];
                  if (!safeComments.find((cm: any) => cm.id === message.data?.id)) {
                    return { ...c, comments: [...safeComments, message.data] };
                  }
                }
                return c;
              }),
            })),
          };
          setSelectedCard((prev) => {
            if (prev && prev.id.toString() === message.cardId) {
              const safeComments = Array.isArray(prev.comments)
                ? prev.comments
                : [];
              if (!safeComments.find((cm: any) => cm.id === message.data?.id)) {
                return { ...prev, comments: [...safeComments, message.data] };
              }
            }
            return prev;
          });
          return updatedBoard;
        });
      }
    },
    [setData]
  );

  const handleChecklistUpdated = useCallback(
    (message: any) => {
      if (message.data) {
        const cardIdStr = message.cardId?.toString();
        setData((currentBoard: any) => ({
          ...currentBoard,
          list: currentBoard.list.map((lane: any) => ({
            ...lane,
            cards: lane.cards.map((c: any) =>
              c.id.toString() === cardIdStr
                ? { ...c, checkedList: message.data }
                : c
            ),
          })),
        }));

        // Sync với Drawer đang mở
        setSelectedCard((prev) => {
          if (prev && prev.id.toString() === cardIdStr) {
            return { ...prev, checkedList: message.data };
          }
          return prev;
        });
      }
    },
    [setData]
  );
  // ─────────────────────────────────────────────────────────────────────────────

  const { status: wsStatus, isConnected } = useWebSocket({
    boardId: boardDetail?.id?.toString(),
    enabled: !!boardDetail?.id,
    onCardCreated: handleCardCreated,
    onCardDeleted: handleCardDeleted,
    onCardUpdated: handleCardUpdated,
    onCardMoved: handleCardMoved,
    onCardCommented: handleCardCommented,
    onCardChecklistUpdated: handleChecklistUpdated,
  });

  const getBoardData = useCallback(() => {
    const seenCardIds = new Set<string>();

    const lanesWithLaneId = Array.isArray(boardDetail?.list)
      ? boardDetail.list
          .map((lane) => {
            if (!lane || typeof lane.id === "undefined") return null;
            const safeCards = Array.isArray(lane.cards)
              ? lane.cards
                  .map((card) => {
                    if (!card || typeof card.id === "undefined") return null;
                    const cardIdStr = card.id.toString();
                    if (seenCardIds.has(cardIdStr)) {
                      console.warn(`Duplicate card detected: ${card.id}`);
                      return null;
                    }
                    seenCardIds.add(cardIdStr);
                    // Add listStatusType to card so BoardCard can check if it's in DONE list
                    return { ...card, laneId: lane.id, listStatusType: lane.statusType };
                  })
                  .filter(
                    (card): card is CardObjType & { laneId: number } =>
                      card !== null
                  )
              : [];
            return { ...lane, cards: safeCards };
          })
          .filter(
            (
              lane
            ): lane is CardListObjType & {
              cards: (CardObjType & { laneId: number })[];
            } => lane !== null
          )
      : [];

    const cleanBoardData = {
      id: boardDetail?.id,
      name: boardDetail?.name,
      lanes: lanesWithLaneId,
    };
    Object.keys(cleanBoardData).forEach((key) => {
      if (cleanBoardData[key as keyof typeof cleanBoardData] === undefined) {
        delete cleanBoardData[key as keyof typeof cleanBoardData];
      }
    });
    return cleanBoardData;
  }, [boardDetail]);

  const [boardData, setBoardData] = useState(getBoardData());

  useEffect(() => {
    if (boardDetail) {
      setBoardData(getBoardData());
    }
  }, [boardDetail, getBoardData]);



  const onCloseAddCard = () => setAddCardOpen(false);

  const triggerMemberRefresh = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    if (boardDetail.id) triggerMemberRefresh();
  }, [boardDetail.id]);

  useEffect(() => {
    (window as any).refreshScrumBoardMembers = triggerMemberRefresh;
    return () => { delete (window as any).refreshScrumBoardMembers; };
  }, []);

  const onClickAddCard = (listId: number) => {
    const normalizedListId = Number(listId);
    const selectedList =
      boardData?.lanes?.find((item) => Number(item.id) === normalizedListId) ||
      null;
    if (!selectedList) {
      showOperationErrorNotification("add card", "Không tìm thấy cột được chọn");
      return;
    }
    setList(selectedList);
    setSelectedCard(null);
    setAddCardOpen(true);
  };

  // Use ref instead of state for immediate access
  const pendingListStatusTypeRef = React.useRef<string>("NONE");

  const onAddList = (name: string, statusType?: string) => {
    if (!canManageBoard) {
      infoViewActionsContext.fetchError("Bạn không có quyền thêm danh sách!");
      return;
    }
    
    const finalStatusType = (statusType && statusType !== "NONE") 
      ? statusType 
      : (pendingListStatusTypeRef.current || "NONE");
    
    postDataApi("/scrumboard/add/list", infoViewActionsContext, {
      name,
      boardId: boardDetail?.id,
      statusType: finalStatusType,
    })
      .then((data) => {
        const newList = data as CardListObjType;
        const updatedBoard = {
          ...boardDetail,
          list: [...(boardDetail.list || []), newList],
        };
        if (setData) setData(updatedBoard);
        showListCreatedNotification(name);
        pendingListStatusTypeRef.current = "NONE";
      })
      .catch((error) => showOperationErrorNotification("thêm danh sách", error?.message || "Đã có lỗi xảy ra"));
  };

  const getCardById = (lane: CardListObjType, cardId: number) => {
    const safeCards = Array.isArray(lane?.cards) ? lane.cards : [];
    return safeCards.find((item) => item.id === cardId);
  };

  const onEditCardDetail = (cardId: number) => {
    const safeLanes = Array.isArray(boardData?.lanes) ? boardData.lanes : [];
    const selectedList = safeLanes.find((item) => {
      const safeCards = Array.isArray(item?.cards) ? item.cards : [];
      return safeCards.find((card) => card.id === cardId);
    });
    const card = getCardById(selectedList as CardListObjType, cardId);
    setSelectedCard(card as CardObjType);
    setList(selectedList as CardListObjType);
    setAddCardOpen(true);
  };

  const handleDragCard = (
    cardId: string | number,
    sourceLaneId: string | number,
    targetLaneId: string | number,
    position: number,
    _cardDetails: any
  ) => {
    if (sourceLaneId === targetLaneId) return;
    if (!canManageBoard) {
      infoViewActionsContext.fetchError("Bạn không có quyền di chuyển thẻ!");
      return;
    }

    const numericCardId = Number(cardId);
    const numericSourceId = Number(sourceLaneId);
    const numericTargetId = Number(targetLaneId);

    const currentLanes = Array.isArray(boardData?.lanes) ? boardData.lanes : [];
    const sourceLane = currentLanes.find((l) => l.id === numericSourceId);
    const targetLane = currentLanes.find((l) => l.id === numericTargetId);
    if (!sourceLane || !targetLane) return;

    // ✅ WORKFLOW VALIDATION
    const sourceStatus = sourceLane.statusType || "NONE";
    const targetStatus = targetLane.statusType || "NONE";

    // Check forbidden transitions (e.g., TODO -> DONE)
    if (isTransitionForbidden(sourceStatus, targetStatus)) {
      infoViewActionsContext.fetchError(
        `Không thể chuyển trực tiếp từ ${sourceStatus} sang ${targetStatus}. Vui lòng chuyển qua IN_PROGRESS trước.`
      );
      return;
    }

    // Check dependencies if moving to IN_PROGRESS
    if (requiresDependencyCheck(targetStatus)) {
      const sourceCards = Array.isArray(sourceLane.cards) ? sourceLane.cards : [];
      const movingCard = sourceCards.find((c) => c.id === numericCardId);
      
      if (movingCard && isCardBlocked(movingCard, currentLanes.flatMap(l => l.cards))) {
        infoViewActionsContext.fetchError(
          "Thẻ này đang bị chặn bởi các task phụ thuộc chưa hoàn thành. Vui lòng hoàn thành các task phụ thuộc trước."
        );
        return;
      }
    }

    const sourceCards = Array.isArray(sourceLane.cards) ? [...sourceLane.cards] : [];
    const movingCardIdx = sourceCards.findIndex((c) => c.id === numericCardId);
    if (movingCardIdx < 0) return;

    const [movingCard] = sourceCards.splice(movingCardIdx, 1);
    const targetCards = Array.isArray(targetLane.cards) ? [...targetLane.cards] : [];
    const safePos = Math.max(0, Math.min(position, targetCards.length));
    targetCards.splice(safePos, 0, { ...movingCard, laneId: numericTargetId });

    // ✅ FIX: Save original state for rollback
    const originalBoard = { ...boardDetail };

    // Update UI optimistically (only if not connected to WebSocket)
    if (!isConnected) {
      setData((currentBoard: any) => ({
        ...currentBoard,
        list: (currentBoard.list || []).map((ln: any) => {
          if (ln.id === numericSourceId) return { ...ln, cards: sourceCards } as CardListObjType;
          if (ln.id === numericTargetId) return { ...ln, cards: targetCards } as CardListObjType;
          return ln;
        }),
      }));
    }

    putDataApi<unknown>("/scrumboard/cards/update/category", infoViewActionsContext, {
      cardId: numericCardId,
      laneId: numericTargetId,
    })
      .then(() => {
        if (!isConnected) {
          showCardMovedNotification(
            movingCard?.title || "Card",
            sourceLane.name || "Source",
            targetLane.name || "Target"
          );
        }
      })
      .catch((error) => {
        const errorMessage = error?.message || (typeof error === 'string' ? error : "Đã có lỗi xảy ra");
        showOperationErrorNotification("di chuyển thẻ", errorMessage);
        
        // ✅ FIX: Rollback UI immediately on error
        if (!isConnected) {
          setData(originalBoard);
        }
      });
  };

  const onEditBoardList = (lane: CardListObjType, data: CardObjType) => {
    const newListName = data.title;
    putDataApi<CardListObjType>("/scrumboard/edit/list", infoViewActionsContext, {
      id: lane.id,
      name: newListName,
    })
      .then((data) => {
        const updatedList = data as CardListObjType;
        const updatedBoard = {
          ...boardDetail,
          list: boardDetail.list.map((l) => (l.id === lane.id ? updatedList : l)),
        };
        if (setData) setData(updatedBoard);
        showListUpdatedNotification(newListName || "List");
      })
      .catch((error) => showOperationErrorNotification("cập nhật danh sách", error?.message || "Đã có lỗi xảy ra"));
  };

  const onUpdateListWithStatus = (laneId: string, name: string, statusType: string) => {
    const numericLaneId = Number(laneId);
    
    putDataApi<CardListObjType>("/scrumboard/edit/list", infoViewActionsContext, {
      id: numericLaneId,
      name: name,
      statusType: statusType,
    })
      .then((data) => {
        const updatedList = data as CardListObjType;
        const updatedBoard = {
          ...boardDetail,
          list: boardDetail.list.map((l) => {
            if (l.id === numericLaneId) {
              return updatedList;
            }
            return l;
          }),
        };
        
        if (setData) setData(updatedBoard);
        showListUpdatedNotification(name || "List");
      })
      .catch((error) => showOperationErrorNotification("cập nhật danh sách", error?.message || "Đã có lỗi xảy ra"));
  };

  const onDeleteSelectedList = (laneId: number) => {
    deleteDataApi<string>("/scrumboard/delete/list", infoViewActionsContext, { id: laneId })
      .then(() => {
        const updatedBoard = {
          ...boardDetail,
          list: boardDetail.list.filter((l) => l.id !== laneId),
        };
        if (setData) setData(updatedBoard);
        infoViewActionsContext.showMessage("Xóa danh sách thành công!");
      })
      .catch((error) => infoViewActionsContext.fetchError(error.message));
  };

  return (
    <AppsContent fullView>
      <StyledScrumBoardTopActions>
        <StyledScrumBoardStatusBox>
          <ConnectionStatusIndicator status={wsStatus} />
        </StyledScrumBoardStatusBox>
        {(boardDetail.startDate || boardDetail.endDate) && (
          <div style={{ fontSize: "13px", color: "#666", marginLeft: "16px" }}>
            {boardDetail.startDate && <span>Bắt đầu: {new Date(boardDetail.startDate).toLocaleDateString("vi-VN")}</span>}
            {boardDetail.startDate && boardDetail.endDate && <span style={{ margin: "0 8px" }}>|</span>}
            {boardDetail.endDate && <span>Kết thúc: {new Date(boardDetail.endDate).toLocaleDateString("vi-VN")}</span>}
          </div>
        )}
      </StyledScrumBoardTopActions>

      <Board
        laneStyle={{ backgroundColor: theme.palette.background.default }}
        editable={canManageBoard}
        canAddLanes={canManageBoard}
        data={boardData}
        handleDragEnd={handleDragCard}
        onCardAdd={(_: CardObjType, laneId: number) => {
          if (!canManageBoard) {
            infoViewActionsContext.fetchError("Bạn không có quyền thêm thẻ!");
            return;
          }
          onClickAddCard(laneId);
        }}
        onCardClick={(cardId: number, _: any) => onEditCardDetail(cardId)}
        onLaneAdd={(name: string, data?: any) => {
          const statusType = pendingListStatusTypeRef.current;
          onAddList(name, statusType);
        }}
        onLaneUpdate={(laneId: number, data: CardObjType) => {
          if (!canManageBoard) return;
          const lane = boardData.lanes.find((item) => item.id === laneId);
          if (lane) onEditBoardList(lane, data);
        }}
        onLaneDelete={(laneId: number) => {
          if (!isPM) {
            infoViewActionsContext.fetchError("Chỉ Project Manager mới có quyền xóa danh sách!");
            return;
          }
          onDeleteSelectedList(laneId);
        }}
        components={{
          Card: BoardCard,
          LaneHeader: (props: any) => {
            const fullList = boardData?.lanes?.find((l: any) => l.id === props.id);
            return (
              <ListHeader {...props} list={fullList} onUpdateList={onUpdateListWithStatus} />
            );
          },
          AddCardLink: (props: any) =>
            canManageBoard ? (
              <AddCardButton {...props} onClickAddCard={onClickAddCard} />
            ) : null,
          NewLaneForm: canManageBoard ? (props: any) => (
            <AddNewList 
              {...props} 
              onAdd={(name: string, statusType?: string) => {
                if (statusType) {
                  pendingListStatusTypeRef.current = statusType;
                }
                if (props.onAdd) {
                  props.onAdd(name);
                }
              }}
            />
          ) : undefined,
          NewLaneSection: canManageBoard ? NewListButton : () => null,
        }}
      />

      {isAddCardOpen && list ? (
        <AddCard
          isModalVisible={isAddCardOpen}
          handleCancel={onCloseAddCard}
          list={list}
          board={boardDetail}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          setData={setData}
          refreshTrigger={refreshTrigger}
        />
      ) : null}

      {boardDetail?.id ? (
        <BoardAiAssistantPanel
          boardId={boardDetail.id}
          boardName={boardDetail.name}
        />
      ) : null}

    </AppsContent>
  );
};

export default BoardDetailView;
