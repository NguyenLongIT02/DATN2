// import React, {useState} from 'react';
// import IntlMessages from '@crema/helpers/IntlMessages';
// import {HiCheck} from 'react-icons/hi';
// import {CgClose} from 'react-icons/cg';
// import {AiOutlineDelete, AiOutlineEdit} from 'react-icons/ai';
// import {Input} from 'antd';
// import AppIconButton from '@crema/components/AppIconButton';
// import {
//   StyledScrumBoardListHeaderCard,
//   StyledScrumBoardListHeaderFlex,
//   StyledScrumBoardListHeaderFlexAuto,
//   StyledScrumListHeaderList,
// } from './index.styled';
// import AppConfirmationModal from '@crema/components/AppConfirmationModal';
// import {CardListObjType} from '@crema/types/models/apps/ScrumbBoard';

// type ListHeaderProps = {
//   id: string;
//   name: string;
//   list: CardListObjType;
//   boardId: number;
//   onDelete: (id: string) => void;
//   updateTitle: (str: string) => void;
// };

// const ListHeader: React.FC<ListHeaderProps> = ({
//   name,
//   id,
//   onDelete,
//   updateTitle,
// }) => {
//   const [isEditListName, setEditListName] = useState(false);

//   const [editedListName, setEditedListName] = useState('');

//   const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

//   const onDeleteBoardList = () => {
//     onDelete(id);
//     setDeleteDialogOpen(false);
//   };

//   const onEditButtonClick = () => {
//     setEditedListName(name);
//     setEditListName(!isEditListName);
//   };

//   const onEditListName = () => {
//     if (editedListName !== '') {
//       updateTitle(editedListName);
//       setEditListName(false);
//     }
//   };

//   return (
//     <StyledScrumBoardListHeaderCard>
//       <StyledScrumBoardListHeaderFlex>
//         {!isEditListName ? (
//           <>
//             <h5>{name}</h5>
//             <StyledScrumBoardListHeaderFlexAuto>
//               <AppIconButton
//                 icon={<AiOutlineEdit />}
//                 onClick={onEditButtonClick}
//               />

//               <AppIconButton
//                 icon={<AiOutlineDelete />}
//                 onClick={() => setDeleteDialogOpen(true)}
//               />
//             </StyledScrumBoardListHeaderFlexAuto>
//           </>
//         ) : (
//           <>
//             <StyledScrumListHeaderList>
//               <Input
//                 value={editedListName}
//                 onChange={(event) => setEditedListName(event.target.value)}
//               />
//             </StyledScrumListHeaderList>
//             <StyledScrumBoardListHeaderFlexAuto>
//               <AppIconButton icon={<HiCheck />} onClick={onEditListName} />
//               <AppIconButton
//                 icon={<CgClose />}
//                 onClick={() => setEditListName(false)}
//               />
//             </StyledScrumBoardListHeaderFlexAuto>
//           </>
//         )}
//       </StyledScrumBoardListHeaderFlex>

//       {isDeleteDialogOpen ? (
//         <AppConfirmationModal
//           open={isDeleteDialogOpen}
//           onDeny={setDeleteDialogOpen}
//           onConfirm={onDeleteBoardList}
//           paragraph={<IntlMessages id='scrumboard.deleteMessage' />}
//           modalTitle={<IntlMessages id='common.deleteItem' />}
//         />
//       ) : null}
//     </StyledScrumBoardListHeaderCard>
//   );
// };

// export default ListHeader;

import React, { useState } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { HiCheck } from "react-icons/hi";
import { CgClose } from "react-icons/cg";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { Input } from "antd";
import AppIconButton from "@crema/components/AppIconButton";
import {
  StyledScrumBoardListHeaderCard,
  StyledScrumBoardListHeaderFlex,
  StyledScrumBoardListHeaderFlexAuto,
  StyledScrumListHeaderList,
} from "./index.styled";
import AppConfirmationModal from "@crema/components/AppConfirmationModal";
import { CardListObjType } from "@crema/types/models/apps/ScrumbBoard";

type ListHeaderProps = {
  id: string;
  name: string;
  list: CardListObjType;
  boardId: number;
  onDelete: (id: string) => void;
  updateTitle: (str: string) => void;
};

const ListHeader: React.FC<ListHeaderProps> = ({
  name,
  id,
  onDelete,
  updateTitle,
}) => {
  const [isEditListName, setEditListName] = useState(false);

  const [editedListName, setEditedListName] = useState("");

  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDeleteBoardList = () => {
    onDelete(id);
    setDeleteDialogOpen(false);
  };

  const onEditButtonClick = () => {
    setEditedListName(name);
    setEditListName(!isEditListName);
  };

  const onEditListName = () => {
    if (editedListName !== "") {
      updateTitle(editedListName);
      setEditListName(false);
    }
  };

  return (
    <StyledScrumBoardListHeaderCard>
      <StyledScrumBoardListHeaderFlex>
        {!isEditListName ? (
          <>
            <h5>{name}</h5>
            <StyledScrumBoardListHeaderFlexAuto>
              <AppIconButton
                icon={<AiOutlineEdit />}
                onClick={onEditButtonClick}
              />

              <AppIconButton
                icon={<AiOutlineDelete />}
                onClick={() => setDeleteDialogOpen(true)}
              />
            </StyledScrumBoardListHeaderFlexAuto>
          </>
        ) : (
          <>
            <StyledScrumListHeaderList>
              <Input
                value={editedListName}
                onChange={(event) => setEditedListName(event.target.value)}
              />
            </StyledScrumListHeaderList>
            <StyledScrumBoardListHeaderFlexAuto>
              <AppIconButton icon={<HiCheck />} onClick={onEditListName} />
              <AppIconButton
                icon={<CgClose />}
                onClick={() => setEditListName(false)}
              />
            </StyledScrumBoardListHeaderFlexAuto>
          </>
        )}
      </StyledScrumBoardListHeaderFlex>

      {isDeleteDialogOpen ? (
        <AppConfirmationModal
          open={isDeleteDialogOpen}
          onDeny={setDeleteDialogOpen}
          onConfirm={onDeleteBoardList}
          paragraph={<IntlMessages id="scrumboard.deleteMessage" />}
          modalTitle={<IntlMessages id="common.deleteItem" />}
        />
      ) : null}
    </StyledScrumBoardListHeaderCard>
  );
};

export default ListHeader;