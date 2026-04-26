import React from 'react';
import {MdAdd} from 'react-icons/md';
import IntlMessages from '@crema/helpers/IntlMessages';
import {
  StyledScrumBoardAddcard,
  StyledScrumBoardAddCardIcon,
  StyledScrumBoardAddCardText,
} from './index.styled';

type AddBoardButtonProps = {
  onAddButtonClick: () => void;
};

const AddBoardButton: React.FC<AddBoardButtonProps> = ({onAddButtonClick}) => {
  return (
    <StyledScrumBoardAddcard onClick={() => onAddButtonClick()}>
      <StyledScrumBoardAddCardIcon>
        <MdAdd />
      </StyledScrumBoardAddCardIcon>
      <StyledScrumBoardAddCardText>
        <IntlMessages id='scrumboard.addNewBoard' />
      </StyledScrumBoardAddCardText>
    </StyledScrumBoardAddcard>
  );
};

export default AddBoardButton;
