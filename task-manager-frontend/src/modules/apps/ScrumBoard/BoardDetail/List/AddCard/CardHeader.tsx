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
};

const CardHeader: React.FC<CardHeaderProps> = ({
  onClickDeleteIcon,
  onAddAttachments,
  board,
  list,
}) => {
  const {getRootProps, getInputProps} = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    onDrop: (acceptedFiles) => {
      const files = acceptedFiles.map((file) => {
        return {
          id: generateRandomUniqueNumber(),
          file,
          preview: URL.createObjectURL(file),
        };
      });
      onAddAttachments(files);
    },
  });

  return (
    <StyledScrumBoardCardHeader>
      <h3 className='text-truncate'>
        {board.name} &gt; {list!.name}
      </h3>
      <StyledScrumBoardCardHeaderAction>
        <AppIconButton
          icon={
            <div {...getRootProps({className: 'dropzone'})}>
              <input {...getInputProps()} />
              <IoMdAttach />
            </div>
          }
        />

        <AppIconButton icon={<AiOutlineDelete />} onClick={onClickDeleteIcon} />
      </StyledScrumBoardCardHeaderAction>
    </StyledScrumBoardCardHeader>
  );
};

export default CardHeader;
