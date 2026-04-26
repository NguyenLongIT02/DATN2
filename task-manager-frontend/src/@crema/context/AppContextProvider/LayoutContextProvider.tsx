import React, {createContext, ReactNode, useContext, useState} from 'react';
import defaultConfig from '@crema/constants/defaultConfig';

export type LayoutData = {
  layoutType: string;
  navStyle: string;
  footerType: string;
  direction: string;
  footer: boolean;
};

export type LayoutActions = {
  updateLayoutType: (layout: string) => void;
  updateNavStyle: (navStyle: string) => void;
  setFooterType: (footerType: string) => void;
  setFooter: (footer: boolean) => void;
  updateDirection: (direction: string) => void;
};

const LayoutContext = createContext<LayoutData>({
  footer: defaultConfig.footer,
  navStyle: defaultConfig.navStyle,
  layoutType: defaultConfig.layoutType,
  footerType: defaultConfig.footerType,
  direction: defaultConfig.direction,
});

const LayoutActionsContext = createContext<LayoutActions>({
  updateLayoutType: () => {},
  updateNavStyle: () => {},
  setFooterType: () => {},
  setFooter: () => {},
  updateDirection: () => {},
});

export const useLayoutContext = () => useContext(LayoutContext);

export const useLayoutActionsContext = () => useContext(LayoutActionsContext);

type LayoutContextProviderProps = {
  children: ReactNode;
};

const LayoutContextProvider: React.FC<LayoutContextProviderProps> = ({
  children,
}) => {
  const [layoutType, updateLayoutType] = useState<string>(
    defaultConfig.layoutType,
  );
  const [navStyle, updateNavStyle] = useState<string>(defaultConfig.navStyle);
  const [direction, updateDirection] = useState<string>(
    defaultConfig.direction,
  );
  const [footerType, setFooterType] = useState<string>(
    defaultConfig.footerType,
  );
  const [footer, setFooter] = useState<boolean>(defaultConfig.footer);

  return (
    <LayoutContext.Provider
      value={{
        navStyle,
        direction,
        footerType,
        footer,
        layoutType,
      }}
    >
      <LayoutActionsContext.Provider
        value={{
          setFooter,
          setFooterType,
          updateNavStyle,
          updateLayoutType,
          updateDirection,
        }}
      >
        {children}
      </LayoutActionsContext.Provider>
    </LayoutContext.Provider>
  );
};

export default LayoutContextProvider;
