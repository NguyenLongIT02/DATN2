import React from 'react';
import IntlMessages from '@crema/helpers/IntlMessages';
import {MdAdd} from 'react-icons/md';
import {
  StyledScrumBoardAddIcon,
  StyledScrumBoardAddList,
  StyledScrumBoardAddListCard,
  StyledScrumBoardAddText,
} from './index.styled';

type NewListButtonProps = {
  onClick: () => void;
};

const NewListButton: React.FC<NewListButtonProps> = ({onClick}) => {
  return (
    <StyledScrumBoardAddListCard>
      <StyledScrumBoardAddList>
        <StyledScrumBoardAddIcon onClick={onClick}>
          <MdAdd />
        </StyledScrumBoardAddIcon>
        <StyledScrumBoardAddText>
          <IntlMessages id='scrumboard.addAList' />
        </StyledScrumBoardAddText>
      </StyledScrumBoardAddList>
    </StyledScrumBoardAddListCard>
  );
};

export default NewListButton;
