import React from "react";
import IntlMessages from "@crema/helpers/IntlMessages";

import {
  StyledSCrumBoardAddBtnCard,
  StyledScrumBoardAddBtnCardText,
  StyledScrumBoardAddCardBtnUser,
  StyledScrumBoardAddCardUserAvatar,
  StyledScrumBoardMdAdd,
} from "./index.styled";

type AddCardButtonProps = {
  laneId?: number;
  list?: any;
  onClick?: () => void;
  t?: (laneId: number) => void;
  onClickAddCard?: (listId: number) => void;
};

const AddCardButton: React.FC<AddCardButtonProps> = (props) => {
  const handleClick = () => {
    // Priority 1: onClickAddCard callback (used to open custom modal)
    if (props.onClickAddCard) {
      const id = props.laneId !== undefined ? props.laneId : props.list?.id;
      if (id !== undefined) {
        props.onClickAddCard(Number(id));
        return;
      }
    }

    // Priority 2: standard onClick prop (used by react-trello)
    if (props.onClick) {
      props.onClick();
      return;
    }

    // Priority 3: t function (translation/callback pattern)
    if (props.t && props.laneId !== undefined) {
      props.t(props.laneId);
      return;
    }
  };

  return (
    <StyledSCrumBoardAddBtnCard onClick={handleClick}>
      <StyledScrumBoardAddCardBtnUser>
        <StyledScrumBoardAddCardUserAvatar>
          <StyledScrumBoardMdAdd />
        </StyledScrumBoardAddCardUserAvatar>
        <StyledScrumBoardAddBtnCardText>
          <IntlMessages id="scrumboard.addACard" />
        </StyledScrumBoardAddBtnCardText>
      </StyledScrumBoardAddCardBtnUser>
    </StyledSCrumBoardAddBtnCard>
  );
};

export default AddCardButton;
