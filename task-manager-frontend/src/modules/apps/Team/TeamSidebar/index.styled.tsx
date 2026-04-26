import styled from 'styled-components';

export const StyledTeamSidebar = styled.div`
  height: 100%;
`;

export const StyledMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

