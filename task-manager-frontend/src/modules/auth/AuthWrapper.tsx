import React from "react";
import AppAnimateGroup from "@crema/components/AppAnimateGroup";
import {
  StyledAuthCard,
  StyledAuthCardHeader,
  StyledAuthMainContent,
  StyledAuthWelContent,
  StyledAuthWellAction,
  StyledAuthWrap,
} from "./AuthWrapper.styled";
import AppLogo from "@crema/components/AppLayout/components/AppLogo";

type Props = {
  children: React.ReactNode;
};
const AuthWrapper: React.FC<Props> = ({ children }) => {
  return (
    <AppAnimateGroup
      type="scale"
      animateStyle={{ flex: 1 }}
      delay={0}
      interval={10}
      duration={200}
    >
      <StyledAuthWrap key={"wrap"}>
        <StyledAuthCard>
          <StyledAuthMainContent>
            <StyledAuthCardHeader>
              <AppLogo />
            </StyledAuthCardHeader>
            {children}
          </StyledAuthMainContent>
          <StyledAuthWellAction>
            <StyledAuthWelContent>
              <h2>Welcome to Crema!</h2>
              <p>Crema is a task and timeline management website.</p>
            </StyledAuthWelContent>
          </StyledAuthWellAction>
        </StyledAuthCard>
      </StyledAuthWrap>
    </AppAnimateGroup>
  );
};
export default AuthWrapper;
