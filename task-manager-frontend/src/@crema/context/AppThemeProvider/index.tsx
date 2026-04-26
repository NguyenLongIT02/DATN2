import React, { ReactElement, useEffect } from "react";
import { ConfigProvider } from "antd";
import { ThemeProvider } from "styled-components";
import { useLayoutContext } from "../AppContextProvider/LayoutContextProvider";
import { useLocaleContext } from "../AppContextProvider/LocaleContextProvider";
import { useThemeContext } from "../AppContextProvider/ThemeContextProvider";
import AppLocale from "@crema/services/localization";
import { getAntTheme } from "@crema/helpers/ThemeHelper";

interface AppThemeProviderProps {
  children: ReactElement;
}

const AppThemeProvider: React.FC<AppThemeProviderProps> = (props) => {
  const { direction } = useLayoutContext();
  const { locale } = useLocaleContext();
  const { theme } = useThemeContext();

  const { antLocale } = AppLocale[locale.locale];

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  return (
    <ThemeProvider theme={theme}>
      <ConfigProvider
        // direction={direction}
        locale={antLocale}
        theme={{
          token: getAntTheme(theme),
        }}
      >
        {props.children}
      </ConfigProvider>
    </ThemeProvider>
  );
};

export default React.memo(AppThemeProvider);
