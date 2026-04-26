import AppRowContainer from "@crema/components/AppRowContainer";
import AppCard from "@crema/components/AppCard";
import { Button, Modal } from "antd";
import styled from "styled-components";

export const StyledScrumBoardWrap = styled.div`
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const StyledScrumBoardHeader = styled.div`
  margin-bottom: 20px;
  margin-top: 20px;
  text-align: center;

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.xxl}px) {
    margin-bottom: 32px;
    margin-top: 32px;
  }

  & h2 {
    color: ${({ theme }) => theme.palette.text.primary};
    font-weight: 700;
    font-size: 32px; /* Increased from lg */
    margin-bottom: 0;
    letter-spacing: -0.02em;

    @media screen and (min-width: ${({ theme }) => theme.breakpoints.md}px) {
      font-size: 40px;
    }
  }
`;

export const StyledScrumBoardContainer = styled(AppRowContainer)`
  justify-content: center;
`;

export const StyledScrumBoardCard = styled(AppCard)`
  border-radius: ${({ theme }) => theme.cardRadius};
  background-color: ${({ theme }) => theme.palette.primary.main} !important;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 224px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    background-color: ${({ theme }) => theme.palette.primary.dark} !important;
  }

  & .ant-card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`;

export const StyledScrumListIcon = styled.div`
  margin-bottom: 25px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  & svg {
    color: white;
    transition: all 0.2s ease;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    font-size: 26px;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: scale(1.15);
    }
  }

  & svg:first-child {
    color: white;
    cursor: default;
    font-size: 30px;
    min-width: 50px;
    min-height: 50px;

    &:hover {
      background-color: transparent;
      transform: none;
    }
  }

  @media screen and (min-width: ${({ theme }) => theme.breakpoints.md}px) {
    gap: 25px;

    & svg {
      font-size: 28px;
      min-width: 48px;
      min-height: 48px;
      padding: 12px;
    }

    & svg:first-child {
      font-size: 32px;
      min-width: 54px;
      min-height: 54px;
    }
  }
`;

export const StyledScrumBoardCardText = styled.p`
  margin-bottom: 0;
  font-size: ${({ theme }) => theme.font.size.base};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledScrumBoardCardDate = styled.div`
  font-size: 12px;
  color: white !important;
  margin-top: 8px;
  opacity: 0.9;

  & div {
    color: white !important;
  }
`;

export const StyledScrumBoardAddModal = styled(Modal)`
  position: relative;
`;

export const StyledScrumAddBoardFooterBtn = styled(Button)`
  width: 94px;
`;

export const StyledScrumAddBoardCard = styled(AppCard)`
  & .ant-card-body {
    padding: 0;
  }
`;

export const StyledScrumBoardAddcard = styled(AppCard)`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.cardRadius};
  cursor: pointer;
  background-color: ${({ theme }) => theme.palette.background.paper};
  height: 224px;
  border: dashed 2px ${({ theme }) => theme.palette.gray[600]};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.primary.light}10;
  }

  & .ant-card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`;

export const StyledScrumBoardAddCardIcon = styled.span`
  background-color: ${({ theme }) => theme.palette.gray[500]};
  color: white;
  border-radius: ${({ theme }) => theme.sizes.borderRadius.circle};
  margin-bottom: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  & svg {
    font-size: 24px;
    transition: all 0.3s ease;

    @media screen and (min-width: ${({ theme }) => theme.breakpoints.xxl}px) {
      font-size: 40px;
    }
  }
`;

export const StyledScrumBoardAddCardText = styled.p`
  margin-bottom: 0;
  font-size: ${({ theme }) => theme.font.size.base};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;
