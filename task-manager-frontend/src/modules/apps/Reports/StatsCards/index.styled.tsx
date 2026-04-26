import AppCard from "@crema/components/AppCard";
import styled from "styled-components";
import { rgba } from "polished";

export const StyledStatsCard = styled(AppCard)`
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }

  & .ant-card-body {
    padding: 24px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #0a8fdc, #52c41a);
    border-radius: 16px 16px 0 0;
  }
`;

export const StyledStatsContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
`;

export const StyledStatsIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.05)
    );
    border-radius: 16px;
  }

  & > * {
    position: relative;
    z-index: 1;
  }
`;

export const StyledStatsInfo = styled.div`
  flex: 1;
  position: relative;

  h3 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px;
    color: ${({ theme }) => theme.palette.text.primary};
    line-height: 1.2;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.palette.text.primary},
      ${({ theme }) => theme.palette.primary.main}
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 16px;
    color: ${({ theme }) => theme.palette.text.secondary};
    margin: 0 0 12px;
    font-weight: 500;
  }

  .growth {
    font-size: 16px;
    font-weight: 600;
    color: #52c41a;
    background: ${rgba("#52c41a", 0.1)};
    padding: 4px 12px;
    border-radius: 20px;
    display: inline-block;
    border: 1px solid ${rgba("#52c41a", 0.2)};
  }
`;
