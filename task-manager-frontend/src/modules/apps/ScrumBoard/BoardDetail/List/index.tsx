import React from "react";
import ListHeader from "./ListHeader";
import BoardCard from "./BoardCard";
import AddCardButton from "./AddCardButton";
import AppScrollbar from "@crema/components/AppScrollbar";

type ListProps = {
  list: any;
  onEditCardDetail?: (cardId: number) => void;
  onClickAddCard?: (listId: number) => void;
  boardId: number;
};

const List: React.FC<ListProps> = ({
  list,
  onEditCardDetail,
  onClickAddCard,
  boardId,
}) => {
  return (
    <div key={list.id} className="scrum-col">
      <ListHeader
        id={list.id}
        name={list.name}
        list={list}
        onDelete={list.onDelete}
        updateTitle={list.updateTitle}
        boardId={boardId}
      />

      <AppScrollbar className="scroll-scrum-item">
        {Array.isArray(list.cards) && list.cards.length > 0 ? (
          <>
            {list.cards.map((card: any) => {
              // Validate card object - silently skip invalid cards
              if (!card || typeof card.id === "undefined") {
                return null;
              }

              return (
                <BoardCard
                  key={card.id}
                  title={card.title ?? card.name ?? ""}
                  attachments={card.attachments ?? []}
                  label={card.label ?? card.labels ?? []}
                  members={card.members ?? card.userList ?? []}
                  date={card.date ?? card.dueDate ?? ""}
                  comments={card.comments ?? card.commentList ?? []}
                  onClick={() => onEditCardDetail?.(card.id)}
                />
              );
            })}
          </>
        ) : (
          <p
            className="text-center text-gray-400 italic py-3"
            style={{
              padding: "12px",
              textAlign: "center",
              color: "#9ca3af",
              fontStyle: "italic",
            }}
          >
            No cards available
          </p>
        )}
      </AppScrollbar>

      <AddCardButton onClickAddCard={onClickAddCard} list={list} />
    </div>
  );
};

export default List;
