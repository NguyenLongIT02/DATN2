import styled from 'styled-components';

export const StyledNotificationContent = styled.div`
  padding: 20px;
  height: 100%;
`;

export const StyledNotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

export const StyledNotificationItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.palette.dividerColor};
  transition: background-color 0.3s;
  cursor: pointer;

  &.unread {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.default};
  }
`;

export const StyledNotificationInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StyledNotificationMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

