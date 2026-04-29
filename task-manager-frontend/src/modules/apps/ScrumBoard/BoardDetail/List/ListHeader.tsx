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
import { Input, Tag, Select } from "antd";
import AppIconButton from "@crema/components/AppIconButton";
import { getWorkflowStatusColor, getWorkflowStatusDisplay } from "@crema/constants/WorkflowConstants";
import {
  StyledScrumBoardListHeaderCard,
  StyledScrumBoardListHeaderFlex,
  StyledScrumBoardListHeaderFlexAuto,
  StyledScrumListHeaderList,
} from "./index.styled";
import AppConfirmationModal from "@crema/components/AppConfirmationModal";
import { CardListObjType } from "@crema/types/models/apps/ScrumbBoard";

const { Option } = Select;

type ListHeaderProps = {
  id: string;
  name: string;
  list: CardListObjType;
  boardId: number;
  onDelete: (id: string) => void;
  updateTitle: (str: string) => void;
  onUpdateList?: (id: string, name: string, statusType: string) => void;
};

const ListHeader: React.FC<ListHeaderProps> = ({
  name,
  id,
  list,
  onDelete,
  updateTitle,
  onUpdateList,
}) => {
  const [isEditListName, setEditListName] = useState(false);
  const [editedListName, setEditedListName] = useState("");
  const [editedStatusType, setEditedStatusType] = useState("NONE");
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDeleteBoardList = () => {
    onDelete(id);
    setDeleteDialogOpen(false);
  };

  const onEditButtonClick = () => {
    setEditedListName(name);
    setEditedStatusType(list?.statusType || "NONE");
    setEditListName(!isEditListName);
  };

  const onEditListName = () => {
    if (editedListName !== "") {
      if (onUpdateList) {
        onUpdateList(id, editedListName, editedStatusType);
      } else {
        updateTitle(editedListName);
      }
      setEditListName(false);
    }
  };

  return (
    <StyledScrumBoardListHeaderCard>
      <StyledScrumBoardListHeaderFlex>
        {!isEditListName ? (
          <>
            <div style={{ flex: 1 }}>
              <h5>{name}</h5>
              {list?.statusType && list.statusType !== 'NONE' && (
                <Tag 
                  color={getWorkflowStatusColor(list.statusType)}
                  style={{ fontSize: 11, marginTop: 4 }}
                >
                  {getWorkflowStatusDisplay(list.statusType)}
                </Tag>
              )}
            </div>
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
            <StyledScrumListHeaderList style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Input
                value={editedListName}
                onChange={(event) => setEditedListName(event.target.value)}
                placeholder="Tên danh sách"
              />
              <Select
                value={editedStatusType}
                onChange={setEditedStatusType}
                style={{ width: "100%" }}
                size="small"
                placeholder="Workflow type"
              >
                <Option value="NONE">
                  <span style={{ color: "#d9d9d9" }}>● </span>None
                </Option>
                <Option value="TODO">
                  <span style={{ color: "#1890ff" }}>● </span>To Do
                </Option>
                <Option value="IN_PROGRESS">
                  <span style={{ color: "#faad14" }}>● </span>In Progress
                </Option>
                <Option value="DONE">
                  <span style={{ color: "#52c41a" }}>● </span>Done
                </Option>
              </Select>
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