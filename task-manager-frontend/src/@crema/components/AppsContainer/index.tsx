import React, { CSSProperties, ReactNode, useState } from "react";
import AppInfoView from "../AppInfoView";
import AppSidebar from "./AppSidebar";
import clsx from "clsx";
import { MenuOutlined } from "@ant-design/icons";
import QueueAnim, { IQueueTypeOrArrayOrFunc } from "rc-queue-anim";
import { useLayoutContext } from "@crema/context/AppContextProvider/LayoutContextProvider";
import {
  StyledAppContainer,
  StyledAppWrap,
  StyledAppWrapHeader,
  StyledMainContent,
  StyledMainContentCard,
  StyledMenuBtn,
} from "./index.styled";

interface AppsContainerProps {
  title: string | ReactNode;
  type?: IQueueTypeOrArrayOrFunc;
  noContentAnimation?: boolean;
  fullView?: boolean;
  sidebarContent?: ReactNode;
  children: ReactNode;
  cardStyle?: CSSProperties;
}
const AppsContainer: React.FC<AppsContainerProps> = ({
  title = "",
  noContentAnimation = false,
  sidebarContent,
  fullView,
  children,
  type,
  cardStyle,
}) => {
  const [isAppDrawerOpen, setAppDrawerOpen] = useState(false);
  const { footer, navStyle } = useLayoutContext();

  return (
    <StyledAppWrap>
      <StyledAppWrapHeader
        className={clsx({
          appsWrapHeaderFull: fullView,
        })}
      >
        {fullView ? null : (
          <StyledMenuBtn onClick={() => setAppDrawerOpen(!isAppDrawerOpen)}>
            <MenuOutlined className="menu-btn-icon" />
          </StyledMenuBtn>
        )}
        <QueueAnim style={{ zIndex: 3, overflow: "hidden" }} type="scale">
          <h2 className="text-truncate" key="title">
            {title}
          </h2>
        </QueueAnim>
      </StyledAppWrapHeader>

      <StyledAppContainer>
        {sidebarContent ? (
          <QueueAnim style={{ zIndex: 3 }} type={type ? type : "left"}>
            <AppSidebar
              isAppDrawerOpen={isAppDrawerOpen}
              setAppDrawerOpen={setAppDrawerOpen}
              footer={footer}
              fullView={fullView}
              navStyle={navStyle}
              sidebarContent={sidebarContent}
              key="sidebar"
            />
          </QueueAnim>
        ) : null}
        <StyledMainContent
          className={clsx({
            appsMainContentFull: fullView,
          })}
        >
          {noContentAnimation ? (
            <StyledMainContentCard
              bordered={false}
              key="content"
              style={{
                ...cardStyle,
                borderRadius: 16,
              }}
            >
              {children}
            </StyledMainContentCard>
          ) : (
            <QueueAnim
              type={type ? type : "right"}
              style={{ minHeight: "100%" }}
            >
              <StyledMainContentCard
                bordered={false}
                key="content"
                style={{
                  ...cardStyle,
                  borderRadius: 16,
                }}
              >
                {children}
              </StyledMainContentCard>
            </QueueAnim>
          )}
        </StyledMainContent>
      </StyledAppContainer>
    </StyledAppWrap>
  );
};

export default AppsContainer;
