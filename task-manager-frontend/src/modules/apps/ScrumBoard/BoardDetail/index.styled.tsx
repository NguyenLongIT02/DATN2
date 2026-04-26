import AppCard from '@crema/components/AppCard';
import {Button} from 'antd';
import styled from 'styled-components';

export const StyledScrumBoardAddListCard = styled(AppCard)`
  width: 280px;
  margin: 4px 0 8px 8px;

  [dir='rtl'] & {
    margin-left: 0;
    margin-right: 8px;
  }

  & .ant-card-body {
    padding: 16px 24px;
  }
`;

export const StyledScrumBoardAddList = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledScrumBoardAddIcon = styled.span`
  cursor: pointer;
  background-color: ${({theme}) => theme.palette.gray[100]};
  border: solid dashed ${({theme}) => theme.palette.borderColor};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({theme}) => theme.sizes.borderRadius.circle};

  & svg {
    color: ${({theme}) => theme.palette.text.disabled};
    font-weight: ${({theme}) => theme.font.weight.light};
    font-size: 24px;
  }
`;

export const StyledScrumBoardAddText = styled.p`
  margin-left: 14px;
  font-weight: ${({theme}) => theme.font.weight.medium};
  font-size: 15px;
  margin-bottom: 0;

  [dir='rtl'] & {
    margin-left: 0;
    margin-right: 14px;
  }
`;

export const StyledScrumBoardDetailTitle = styled.span`
  cursor: pointer;
  margin-right: 8px;
  color: ${({theme}) => theme.palette.primary.main};
`;

export const StyledScrumBoardAddClose = styled.span`
  margin-left: 10px;

  [dir='rtl'] & {
    margin-left: 0;
    margin-right: 10px;
  }
`;

export const StyledScrumBoardAddListFormFilled = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const StyledScrumBoardAddListBtn = styled(Button)`
  padding-left: 24px;
  padding-right: 24px;
  margin-top: 12px;
`;

export const StyledScrumBoardTopActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

export const StyledScrumBoardStatusBox = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({theme}) => theme.palette.background.paper};
  padding: 6px 14px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  border: 1px solid ${({theme}) => theme.palette.borderColor};
  pointer-events: auto;
`;

export const StyledScrumBoardActionBtn = styled(Button)`
  background-color: ${({theme}) => theme.palette.background.paper} !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
  border: 1px solid ${({theme}) => theme.palette.borderColor} !important;
  border-radius: 20px !important;
  display: flex !important;
  align-items: center !important;
  padding: 8px 16px !important;
  height: 36px !important;
  pointer-events: auto;

  &:hover {
    background-color: ${({theme}) => theme.palette.gray[100]} !important;
  }
`;

