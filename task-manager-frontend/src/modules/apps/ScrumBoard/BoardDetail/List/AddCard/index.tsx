import React, { useState } from "react";
import AppConfirmationModal from "@crema/components/AppConfirmationModal";
import IntlMessages from "@crema/helpers/IntlMessages";
import AddCardForm from "./AddCardForm";
import { useAuthUser } from "@crema/hooks/AuthHooks";
import { StyledScrumBoardAppCardDrawer } from "./index.styled";
import { postDataApi, deleteDataApi } from "@crema/hooks/APIHooks";
import { useInfoViewActionsContext } from "@crema/context/AppContextProvider/InfoViewContextProvider";
import {
  showCardDeletedNotification,
  showOperationErrorNotification,
} from "@crema/helpers/NotificationHelper";
import CardHeader from "./CardHeader";
import {
  AttachmentObjType,
  BoardObjType,
  CardListObjType,
  CardObjType,
} from "@crema/types/models/apps/ScrumbBoard";

type AddCardProps = {
  isModalVisible: boolean;
  handleCancel: () => void;
  setData: (data: BoardObjType) => void;
  board: BoardObjType;
  list: CardListObjType | null;
  selectedCard: CardObjType | null;
  setSelectedCard: (data: CardObjType) => void;
  refreshTrigger?: number;
};

const AddCard: React.FC<AddCardProps> = ({
  isModalVisible,
  handleCancel,
  board,
  list,
  selectedCard,
  setData,
  refreshTrigger,
}) => {
  const infoViewActionsContext = useInfoViewActionsContext();
  const { user } = useAuthUser();

  // Phân quyền
  const userRole = board?.userRole;
  const canManageBoard = userRole === "Project Manager" || userRole === "Team Lead";

  const [checkedList, setCheckedList] = useState(() => {
    const list = selectedCard?.checkedList;
    return Array.isArray(list) ? list : [];
  });

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedMembers, setMembersList] = useState(() => {
    const members = selectedCard?.members;
    return Array.isArray(members) ? members : [];
  });

  const [selectedLabels, setSelectedLabels] = useState(() => {
    const labels = selectedCard?.label;
    return Array.isArray(labels) ? labels : [];
  });

  const [comments, setComments] = useState(() => {
    const commentList = selectedCard?.comments;
    return Array.isArray(commentList) ? commentList : [];
  });

  // Sync comments when selectedCard changes from WebSocket
  React.useEffect(() => {
    if (selectedCard?.comments) {
      setComments(selectedCard.comments);
    }
  }, [selectedCard?.comments]);



  const onDeleteCard = () => {
    const listId = list!.id;
    const cardId = selectedCard!.id;
    const cardTitle = selectedCard?.title || "Card";

    // Call backend first
    deleteDataApi<string>("/scrumboard/delete/card", infoViewActionsContext, {
      id: cardId,
    })
      .then(() => {
        // Only update UI after successful deletion
        const updatedBoard = {
          ...board,
          list: (board.list || []).map((ln) => {
            if (ln.id !== listId) return ln;
            const safeCards = Array.isArray(ln.cards) ? ln.cards : [];
            return { ...ln, cards: safeCards.filter((c) => c.id !== cardId) };
          }),
        } as any;
        setData(updatedBoard);
        
        showCardDeletedNotification(cardTitle);
        setDeleteDialogOpen(false);
        handleCancel();
      })
      .catch((error) => {
        showOperationErrorNotification("xóa thẻ", error.message || "Không có quyền xóa thẻ");
        setDeleteDialogOpen(false);
      });
  };

  const onClickDeleteIcon = () => {
    if (selectedCard) {
      setDeleteDialogOpen(true);
    } else {
      handleCancel();
    }
  };
  return (
    <StyledScrumBoardAppCardDrawer
      open={isModalVisible}
      width="80%"
      title={
        <CardHeader
          onClickDeleteIcon={onClickDeleteIcon}
          handleCancel={handleCancel}
          board={board}
          list={list}
          canDelete={canManageBoard}
        />
      }
      onClose={handleCancel}
    >
      <AddCardForm
        key={selectedCard?.id || "new-card"}
        board={board}
        list={list}
        checkedList={checkedList}
        handleCancel={handleCancel}
        setCheckedList={setCheckedList}
        comments={comments}
        setComments={setComments}
        authUser={user}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
        selectedMembers={selectedMembers}
        setMembersList={setMembersList}
        selectedCard={selectedCard}
        onCloseAddCard={handleCancel}
        setData={setData}
        refreshTrigger={refreshTrigger}
        canManageBoard={canManageBoard}
      />

      {isDeleteDialogOpen ? (
        <AppConfirmationModal
          open={isDeleteDialogOpen}
          onDeny={setDeleteDialogOpen}
          onConfirm={onDeleteCard}
          modalTitle={<IntlMessages id="scrumboard.deleteCard" />}
          paragraph={<IntlMessages id="common.deleteItem" />}
        />
      ) : null}
    </StyledScrumBoardAppCardDrawer>
  );
};

export default AddCard;
