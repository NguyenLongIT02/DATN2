import React from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import AppAnimate from "../AppAnimate";
import {
  StyledContainerHeader,
  StyledHeaderTitle,
  StyledTitleH3,
  StyledTextBase,
} from "./index.styled";

type AppComponentHeaderProps = {
  title: string;
  description?: string;
  refUrl?: string;
};

const AppComponentHeader: React.FC<AppComponentHeaderProps> = ({
  title,
  description,
  refUrl,
}) => {
  return (
    <AppAnimate animation="transition.slideDownIn" delay={200}>
      <StyledContainerHeader key={"header"}>
        <StyledHeaderTitle>
          <StyledTitleH3 level={3}>{title}</StyledTitleH3>
          {description ? (
            <StyledTextBase level={5}>{description}</StyledTextBase>
          ) : null}
        </StyledHeaderTitle>
        {refUrl ? (
          <div style={{ height: 30 }}>
            <Button
              type="primary"
              ghost
              style={{
                paddingTop: 8,
                lineHeight: 0,
              }}
              href={refUrl}
              icon={<LinkOutlined />}
              target="_blank"
            >
              Reference
            </Button>
          </div>
        ) : null}
      </StyledContainerHeader>
    </AppAnimate>
  );
};

export default AppComponentHeader;
