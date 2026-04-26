import { useState } from "react";
import { useNavigate } from "react-router-dom";
import IntlMessages from "@crema/helpers/IntlMessages";
// import AppInfoView from "@crema/components/AppInfoView";
import { Col } from "antd";
import {
  StyledScrumBoardContainer,
  StyledScrumBoardHeader,
  StyledScrumBoardWrap,
} from "./index.styled";
import {
  postDataApi,
  putDataApi,
  useGetDataApi,
  deleteDataApi,
} from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  showBoardCreatedNotification,
  showBoardUpdatedNotification,
  showBoardDeletedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";
import { Modal } from "antd";
import BoardItem from "./BoardItem";
import AddBoardButton from "./AddBoardButton";
import AddNewBoard from "./AddNewBoard";
import type { BoardObjType } from "@crema/types/models/apps/ScrumbBoard";

const BoardList = () => {
  const navigate = useNavigate();
  const infoViewActionsContext = useInfoViewActionsContext();

  const [{ apiData: boardList }, { setData, reCallAPI }] = useGetDataApi<
    BoardObjType[]
  >("/scrumboard/board/list");

  // Debug logs removed

  const [selectedBoard, setSelectedBoard] = useState<BoardObjType | null>(null);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedBoard(null);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const onEditButtonClick = (board: BoardObjType) => {
    setSelectedBoard(board);
    setIsModalVisible(true);
  };

  const onAddBoard = (name: string, startDate?: string, endDate?: string) => {
    if (selectedBoard) {
      const board = { ...selectedBoard, name, startDate, endDate };
      putDataApi("/scrumboard/board/edit/board", infoViewActionsContext, {
        id: board.id,
        name: name,
        startDate: startDate,
        endDate: endDate,
      })
        .then(() => {
          // Update the board in the list
          const updatedList = boardList.map((b) =>
            b.id === board.id ? board : b
          );
          if (setData) setData(updatedList);
          // Force refresh the API data to ensure consistency
          if (reCallAPI) {
            reCallAPI();
          }
          showBoardUpdatedNotification(name);
          setIsModalVisible(false);
          setSelectedBoard(null);
        })
        .catch((error) => {
          showOperationErrorNotification("update board", error.message);
        });
    } else {
      postDataApi<BoardObjType>(
        "/scrumboard/board/add/board",
        infoViewActionsContext,
        {
          name: name,
          startDate: startDate,
          endDate: endDate,
        }
      )
        .then((data) => {
          const updatedList = boardList ? [...boardList, data] : [data];
          if (setData) {
            setData(updatedList);
          }
          // Force refresh the API data to ensure consistency
          if (reCallAPI) {
            reCallAPI();
          }
          showBoardCreatedNotification(name);
          setIsModalVisible(false);
          setSelectedBoard(null);
        })
        .catch((error) => {
          showOperationErrorNotification("create board", error.message);
        });
    }
  };

  const onDeleteButtonClick = (board: BoardObjType) => {
    Modal.confirm({
      title: "Delete Board",
      content: `Are you sure you want to delete "${board.name}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        // Call delete API
        deleteDataApi(
          "/scrumboard/board/delete/board",
          infoViewActionsContext,
          {
            id: board.id,
          }
        )
          .then(() => {
            // Remove board from list
            const updatedList = boardList.filter((b) => b.id !== board.id);
            if (setData) setData(updatedList);
            // Force refresh the API data to ensure consistency
            if (reCallAPI) {
              reCallAPI();
            }
            showBoardDeletedNotification(board.name);
          })
          .catch((error) => {
            showOperationErrorNotification("delete board", error.message);
          });
      },
    });
  };

  const onViewBoardDetail = (board: BoardObjType) => {
    navigate(`/collaboration/kanban-board/${board.id}`);
  };

  const showModal = () => {
    setSelectedBoard(null);
    setIsModalVisible(true);
  };

  return (
    <>
      <StyledScrumBoardWrap>
        <StyledScrumBoardHeader>
          <h2>
            <IntlMessages id="scrumboard.scrumboardApp" />
          </h2>
        </StyledScrumBoardHeader>
        <StyledScrumBoardContainer>
          {boardList && boardList.length > 0
            ? boardList.map((board: BoardObjType) => {
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={board.id}>
                    <BoardItem
                      board={board}
                      onEditButtonClick={onEditButtonClick}
                      onDeleteButtonClick={onDeleteButtonClick}
                      onViewBoardDetail={onViewBoardDetail}
                    />
                  </Col>
                );
              })
            : null}
          <Col xs={24} sm={12} md={8} lg={6}>
            <AddBoardButton onAddButtonClick={showModal} />
          </Col>
        </StyledScrumBoardContainer>
      </StyledScrumBoardWrap>

      {isModalVisible ? (
        <AddNewBoard
          isModalVisible={isModalVisible}
          handleCancel={handleCancel}
          onAddBoard={onAddBoard}
          handleOk={handleOk}
          selectedBoard={selectedBoard}
        />
      ) : null}
    </>
  );
};

export default BoardList;
