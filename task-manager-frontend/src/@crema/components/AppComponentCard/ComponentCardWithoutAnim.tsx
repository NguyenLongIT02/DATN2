import React, { ReactNode, useState } from "react";
import { Button } from "antd";
import { Highlight } from "prism-react-renderer";
import { highlightTheme } from "./highlightTheme";
import AppScrollbar from "../AppScrollbar";
import Expand from "../AppAnimate/Expand";
import {
  StyledCompCard,
  StyledCompCardTitleDesc,
  StyledHiOutlineCode,
  StyledComponentRoot,
  StyledPreTag,
} from "./index.styled";

interface ComponentCardWithoutAnimProps {
  title: any;
  className?: string;
  component: any;
  source?: any;
  maxHeight?: number;
  size?: number;
  description?: ReactNode;
  noScrollbar?: boolean;
}

const ComponentCardWithoutAnim: React.FC<ComponentCardWithoutAnimProps> = ({
  title,
  description = "",
  className,
  maxHeight = 500,
  component: Component,
  source,
}) => {
  const [viewSource, setToggleViewSource] = useState(false);
  return (
    <StyledCompCard
      className={className}
      title={
        <>
          <span>{title}</span>
          <StyledCompCardTitleDesc className="text-truncate">
            {description}
          </StyledCompCardTitleDesc>
        </>
      }
      extra={
        source ? (
          <Button
            aria-label="view code"
            shape="circle"
            onClick={() => setToggleViewSource(!viewSource)}
          >
            <StyledHiOutlineCode />
          </Button>
        ) : null
      }
    >
      <Expand open={viewSource}>
        {source ? (
          <AppScrollbar
            style={{
              borderRadius: 8,
              background: "#333333",
              height: 350,
              maxHeight: 400,
            }}
          >
            <Highlight code={source} language="jsx" theme={highlightTheme}>
              {({ style, tokens, getLineProps, getTokenProps }) => (
                <StyledPreTag style={{ ...style, maxHeight: 500 }}>
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line, key: i })}>
                      {line.map((token, key) => (
                        <span key={i} {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  ))}
                </StyledPreTag>
              )}
            </Highlight>
          </AppScrollbar>
        ) : null}
      </Expand>

      <AppScrollbar style={{ maxHeight: maxHeight, position: "relative" }}>
        <StyledComponentRoot>
          <Component />
        </StyledComponentRoot>
      </AppScrollbar>
    </StyledCompCard>
  );
};

export default ComponentCardWithoutAnim;
