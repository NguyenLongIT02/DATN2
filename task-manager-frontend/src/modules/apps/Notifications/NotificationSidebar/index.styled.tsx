import styled from 'styled-components';

export const StyledNotificationSidebar = styled.div`
  height: 100%;
`;

export const StyledFilterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.default};
  }

  &.active {
    background-color: ${({ theme }) => theme.palette.primary.main};
    color: white;
  }
`;

