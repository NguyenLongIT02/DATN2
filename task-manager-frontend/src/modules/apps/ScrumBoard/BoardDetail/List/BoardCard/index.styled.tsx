import AppCard from '@crema/components/AppCard';
import {Avatar} from 'antd';
import styled from 'styled-components';

interface CardStatusProps {
  $cardStatus?: 'normal' | 'in-progress' | 'overdue' | 'completed';
}

export const StyledScrumBoardCardDetails = styled(AppCard)<CardStatusProps>`
  margin-bottom: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  & .ant-card-body {
    padding: 16px 24px;
  }

  /* Card background color based on status */
  ${({$cardStatus}) => {
    if ($cardStatus === 'completed') {
      return `
        background: #d9f7be !important;
        border: 1px solid #b7eb8f !important;
        border-left: 4px solid #52c41a !important;
        
        &:hover {
          background: #b7eb8f !important;
          box-shadow: 0 4px 12px rgba(82, 196, 26, 0.35) !important;
        }
      `;
    } else if ($cardStatus === 'overdue') {
      return `
        background: #ffccc7 !important;
        border: 1px solid #ffa39e !important;
        border-left: 4px solid #ff4d4f !important;
        
        &:hover {
          background: #ffa39e !important;
          box-shadow: 0 4px 12px rgba(255, 77, 79, 0.35) !important;
        }
      `;
    } else if ($cardStatus === 'in-progress') {
      return `
        background: #ffe58f !important;
        border: 1px solid #ffd666 !important;
        border-left: 4px solid #faad14 !important;
        
        &:hover {
          background: #ffd666 !important;
          box-shadow: 0 4px 12px rgba(250, 173, 20, 0.35) !important;
        }
      `;
    }
    return `
      background: ${({theme}) => theme.palette.background.paper} !important;
      border-left: 4px solid transparent;
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }
    `;
  }}
`;

export const StyledScrumBoardCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;



export const StyledScrumBoardCardDetailTitle = styled.h3`
  font-size: ${({theme}) => theme.font.size.base};
  font-weight: ${({theme}) => theme.font.weight.medium};
  margin-right: 8px;
  white-space: normal;

  [dir='rtl'] & {
    margin-right: 0;
    margin-left: 8px;
  }
`;



export const StyledScrumBoardCardDetailUser = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledScrumBoardCardDetailDate = styled.span<CardStatusProps>`
  margin-left: 4px;
  margin-right: auto;
  color: ${({theme}) => theme.palette.text.secondary};
  font-weight: ${({theme}) => theme.font.weight.medium};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;

  [dir='rtl'] & {
    margin-left: 0;
    margin-right: 4px;
  }

  /* Color based on status */
  ${({$cardStatus}) => {
    if ($cardStatus === 'completed') {
      return `
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
        font-weight: 600;
      `;
    } else if ($cardStatus === 'overdue') {
      return `
        color: #ff4d4f;
        background: rgba(255, 77, 79, 0.1);
        font-weight: 600;
      `;
    } else if ($cardStatus === 'in-progress') {
      return `
        color: #faad14;
        background: rgba(250, 173, 20, 0.1);
        font-weight: 600;
      `;
    }
    return '';
  }}
`;
export const StyledScrumBoardCardDetailComment = styled.span`
  margin-left: 8px;
  display: flex;
  align-items: center;
  color: ${({theme}) => theme.palette.text.secondary};

  [dir='rtl'] & {
    margin-left: 0;
    margin-right: 8px;
  }

  & span {
    margin-right: 8px;
    font-weight: ${({theme}) => theme.font.weight.light};

    [dir='rtl'] & {
      margin-right: 0;
      margin-left: 8px;
    }
  }
`;

export const StyledScrumBoardLabelFlex = styled.div`
  margin: 16px -4px;
  display: flex;
  align-items: center;
`;

export const StyledScrumBoardLabel = styled.span`
  width: 32px;
  height: 4px;
  margin-left: 4px;
  margin-right: 4px;
  border-radius: 20px;

  @media screen and (min-width: ${({theme}) => theme.breakpoints.sm}px) {
    height: 6px;
  }
`;

export const StyledScrumBoardMember = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledScrumBoardMemberAvatar = styled(Avatar)`
  width: 35px;
  height: 35px;
  margin-right: 8px;

  [dir='rtl'] & {
    margin-right: 0;
    margin-left: 8px;
  }
`;
