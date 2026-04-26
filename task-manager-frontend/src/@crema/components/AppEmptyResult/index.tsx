import React from 'react';
import {
  StyledEmptyResult,
  StyledTitle,
  StyledParaText,
  StyledEmptyResultBtn,
} from './index.styled';
import IntlMessages from '@crema/helpers/IntlMessages';

type AppEmptyResultProps = {
  title?: string;
  onAction: () => void;
  description?: string;
  actionTitle: string;
};

const AppEmptyResult: React.FC<AppEmptyResultProps> = ({
  title = <IntlMessages id='common.noRecordFound' />,
  description = '',
  actionTitle,
  onAction,
}) => {
  return (
    <StyledEmptyResult>
      <StyledTitle level={4}>{title}</StyledTitle>
      {description ? <StyledParaText>{description}</StyledParaText> : null}
      {actionTitle ? (
        <StyledEmptyResultBtn onClick={onAction}>
          {actionTitle}
        </StyledEmptyResultBtn>
      ) : null}
    </StyledEmptyResult>
  );
};

export default AppEmptyResult;
