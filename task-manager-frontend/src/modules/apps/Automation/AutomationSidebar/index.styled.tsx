import styled from 'styled-components';

export const StyledAutomationSidebar = styled.div`
  height: 100%;
`;

export const StyledMenuItem = styled.div`
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

  .count {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
    background-color: ${({ theme }) => theme.palette.background.default};
  }
`;

