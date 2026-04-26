import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import defaultConfig, { defaultTheme } from "@crema/constants/defaultConfig";
import { LayoutDirection } from "@crema/constants/AppEnums";

export interface ThemeData {
  theme: any;
  themeMode: string;
  themeStyle: string;
}

export interface ThemeActions {
  updateTheme: (theme: any) => void;
  updateThemeMode: (themeMode: string) => void;
  updateThemeStyle: (themeStyle: string) => void;
}

export const ThemeContext = createContext<ThemeData>({
  theme: defaultTheme.theme,
  themeMode: defaultConfig.themeMode,
  themeStyle: defaultConfig.themeStyle,
});

const ThemeActionsContext = createContext<ThemeActions>({
  updateTheme: () => {},
  updateThemeMode: () => {},
  updateThemeStyle: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const useThemeActionsContext = () => useContext(ThemeActionsContext);
type ThemeContextProviderProps = {
  children: ReactNode;
};

const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<any>(defaultTheme.theme);
  const [themeMode, updateThemeMode] = useState<string>(
    defaultConfig.themeMode,
  );
  const [themeStyle, updateThemeStyle] = useState<string>(
    defaultConfig.themeStyle,
  );

  const updateTheme = useCallback((theme: any) => {
    console.log("updateTheme th", theme);
    setTheme(theme);
  }, []);

  // useEffect(() => {
  //   theme.palette = {
  //     ...theme.palette,
  //     mode: themeMode === ThemeMode.DARK ? ThemeMode.DARK : ThemeMode.LIGHT,
  //     background:
  //       themeMode === ThemeMode.DARK ? backgroundDark : backgroundLight,
  //     text: themeMode === ThemeMode.DARK ? textDark : textLight,
  //   };
  //
  //   updateTheme(theme);
  // }, [themeMode, theme, updateTheme]);

  useEffect(() => {
    if (theme.direction === LayoutDirection.RTL) {
      document.body.setAttribute("dir", LayoutDirection.RTL);
    } else {
      document.body.setAttribute("dir", LayoutDirection.LTR);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeStyle,
        themeMode,
      }}
    >
      <ThemeActionsContext.Provider
        value={{
          updateTheme,
          updateThemeStyle,
          updateThemeMode,
        }}
      >
        {children}
      </ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
