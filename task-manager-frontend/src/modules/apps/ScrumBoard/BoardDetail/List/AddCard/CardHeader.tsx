import React from 'react';
import {useDropzone} from 'react-dropzone';
import {IoMdAttach} from 'react-icons/io';
import {AiOutlineDelete} from 'react-icons/ai';
import AppIconButton from '@crema/components/AppIconButton';
import {
  StyledScrumBoardCardHeader,
  StyledScrumBoardCardHeaderAction,
} from './index.styled';
import {
  BoardObjType,
  CardListObjType,
} from '@crema/types/models/apps/ScrumbBoard';
import {generateRandomUniqueNumber} from '@crema/helpers/Common';

type CardHeaderProps = {
  onClickDeleteIcon: () => void;
  onAddAttachments: (files: any[]) => void;
  handleCancel?: () => void;
  board: BoardObjType;
  list: CardListObjType | null;
  canDelete?: boolean;
};

const CardHeader: React.FC<CardHeaderProps> = ({
  onClickDeleteIcon,
  onAddAttachments,
  board,
  list,
  canDelete = true,
}) => {
  return (
    <StyledScrumBoardCardHeader>
      <h3 className='text-truncate'>
        {board.name} &gt; {list!.name}
      </h3>
      <StyledScrumBoardCardHeaderAction>
        {canDelete && (
          <AppIconButton icon={<AiOutlineDelete />} onClick={onClickDeleteIcon} />
        )}
      </StyledScrumBoardCardHeaderAction>
    </StyledScrumBoardCardHeader>
  );
};

export default CardHeader;
