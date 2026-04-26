import styled from "styled-components";

export const StyledTeamContent = styled.div`
  padding: 20px;
  height: 100%;
`;

export const StyledTeamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.palette.text.primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const StyledTeamActions = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

export const StyledMemberCard = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.dividerColor};
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

export const StyledMemberInfo = styled.div`
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.palette.text.primary};
  }

  p {
    font-size: 14px;
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.palette.text.secondary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const StyledMemberStats = styled.div`
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.palette.dividerColor};

  > div {
    display: flex;
    flex-direction: column;
    gap: 4px;

    strong {
      font-size: 18px;
      font-weight: 600;
      color: ${({ theme }) => theme.palette.text.primary};
    }

    span {
      font-size: 12px;
      color: ${({ theme }) => theme.palette.text.secondary};
    }
  }
`;
