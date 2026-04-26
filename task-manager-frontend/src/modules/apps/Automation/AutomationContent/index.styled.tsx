import styled from 'styled-components';

export const StyledAutomationContent = styled.div`
  padding: 20px;
  height: 100%;
`;

export const StyledAutomationHeader = styled.div`
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

export const StyledRuleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 1px solid ${({ theme }) => theme.palette.dividerColor};
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const StyledRuleInfo = styled.div`
  flex: 1;

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: ${({ theme }) => theme.palette.text.primary};
  }

  p {
    font-size: 14px;
    margin: 4px 0;
    color: ${({ theme }) => theme.palette.text.secondary};

    strong {
      color: ${({ theme }) => theme.palette.text.primary};
    }
  }
`;

