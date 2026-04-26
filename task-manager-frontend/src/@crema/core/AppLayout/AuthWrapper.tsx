import React from "react";
import {
  StyledAuth,
  StyledAuthCard,
  StyledAuthCardHeader,
  StyledAuthMainContent,
  StyledAuthWelContent,
  StyledAuthWellAction,
  StyledAuthWrap,
  StyledMainAuthScrollbar,
} from "./AuthWrapper.styled";
import AppLogo from "@crema/components/AppLayout/components/AppLogo";
import AppAnimateGroup from "@crema/components/AppAnimateGroup";
import AppInfoView from "@crema/components/AppInfoView";

type Props = {
  children: React.ReactNode;
};
const AuthWrapper: React.FC<Props> = ({ children }) => {
  return (
    <StyledAuth>
      <StyledMainAuthScrollbar>
        <AppAnimateGroup
          type="scale"
          delay={0}
          style={{ height: "100%", flex: 1 }}
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
                  <p>
                    Crema is purely based on Ant Design components and follows
                    Ant Design guidelines.
                  </p>
                </StyledAuthWelContent>
              </StyledAuthWellAction>
            </StyledAuthCard>
          </StyledAuthWrap>
        </AppAnimateGroup>
        <AppInfoView />
      </StyledMainAuthScrollbar>
    </StyledAuth>
  );
};

export default AuthWrapper;
