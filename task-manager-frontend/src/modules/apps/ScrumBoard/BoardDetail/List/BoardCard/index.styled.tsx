import AppCard from '@crema/components/AppCard';
import {Avatar} from 'antd';
import styled from 'styled-components';

interface CardStatusProps {
  $cardStatus?: 'normal' | 'due-soon' | 'overdue' | 'completed';
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
        background: linear-gradient(to right, rgba(82, 196, 26, 0.08) 0%, rgba(82, 196, 26, 0.02) 100%);
        border-left: 4px solid #52c41a;
        
        &:hover {
          background: linear-gradient(to right, rgba(82, 196, 26, 0.12) 0%, rgba(82, 196, 26, 0.04) 100%);
          box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15);
        }
      `;
    } else if ($cardStatus === 'overdue') {
      return `
        background: linear-gradient(to right, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.02) 100%);
        border-left: 4px solid #ff4d4f;
        
        &:hover {
          background: linear-gradient(to right, rgba(255, 77, 79, 0.12) 0%, rgba(255, 77, 79, 0.04) 100%);
          box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
        }
      `;
    } else if ($cardStatus === 'due-soon') {
      return `
        background: linear-gradient(to right, rgba(250, 173, 20, 0.08) 0%, rgba(250, 173, 20, 0.02) 100%);
        border-left: 4px solid #faad14;
        
        &:hover {
          background: linear-gradient(to right, rgba(250, 173, 20, 0.12) 0%, rgba(250, 173, 20, 0.04) 100%);
          box-shadow: 0 2px 8px rgba(250, 173, 20, 0.15);
        }
      `;
    }
    return `
      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    } else if ($cardStatus === 'due-soon') {
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
