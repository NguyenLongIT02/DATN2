import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledThemeColorSetting,
  StyledThemeColorSettingTitle,
} from "../ThemeColors/index.styled";
import { ThemeMode } from "@crema/constants/AppEnums";
import {
  useThemeActionsContext,
  useThemeContext,
} from "@crema/context/AppContextProvider/ThemeContextProvider";
import { useSidebarActionsContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import {
  backgroundDark,
  backgroundLight,
  DarkSidebar,
  LightSidebar,
  SidebarData,
  textDark,
  textLight,
} from "@crema/constants/defaultConfig";
import clsx from "clsx";
import styled from "styled-components";
import { Radio } from "antd";

const ToggleButtonGroup = styled(Radio.Group)``;
const StyledToggleButton = styled(Radio.Button)``;

const ThemeModes = () => {
  const { updateTheme, updateThemeMode } = useThemeActionsContext();
  const { updateSidebarColorSet } = useSidebarActionsContext();
  const { themeMode, theme } = useThemeContext();
  console.log("themeMode", themeMode);
  console.log("theme", theme);
  console.log("updateTheme", updateTheme);
  console.log("updateThemeMode", updateThemeMode);
  console.log("updateSidebarColorSet", updateSidebarColorSet);
  console.log("ThemeModes", ThemeMode);
  const onModeChange = ({ target: { value } }: any) => {
    console.log("updateTheme value", value);
    let themeMode = value;
    if (themeMode) {
      updateThemeMode(themeMode);
      if (themeMode === ThemeMode.LIGHT) {
        updateSidebarColorSet({
          sidebarBgColor: LightSidebar.sidebarBgColor,
          sidebarTextColor: LightSidebar.sidebarTextColor,
          sidebarMenuSelectedBgColor: LightSidebar.sidebarMenuSelectedBgColor,
          sidebarMenuSelectedTextColor:
            LightSidebar.sidebarMenuSelectedTextColor,
          sidebarHeaderColor: LightSidebar.sidebarHeaderColor,
        } as SidebarData);
      } else {
        updateSidebarColorSet({
          sidebarBgColor: DarkSidebar.sidebarBgColor,
          sidebarTextColor: DarkSidebar.sidebarTextColor,
          sidebarMenuSelectedBgColor: DarkSidebar.sidebarMenuSelectedBgColor,
          sidebarMenuSelectedTextColor:
            DarkSidebar.sidebarMenuSelectedTextColor,
          sidebarHeaderColor: DarkSidebar.sidebarHeaderColor,
        } as SidebarData);
      }
      updateThemeMode(themeMode);
      console.log("ThemeMode.Dark", themeMode);
      updateTheme({
        ...theme,
        palette: {
          ...theme.palette,
          mode: themeMode === ThemeMode.DARK ? ThemeMode.DARK : ThemeMode.LIGHT,
          background:
            themeMode === ThemeMode.DARK ? backgroundDark : backgroundLight,
          text: themeMode === ThemeMode.DARK ? textDark : textLight,
        },
      });
    }
  };

  return (
    <StyledThemeColorSetting>
      <StyledThemeColorSettingTitle>
        <IntlMessages id="customizer.themeMode" />
      </StyledThemeColorSettingTitle>

      <ToggleButtonGroup
        value={themeMode}
        onChange={onModeChange}
        aria-label="text alignment"
        buttonStyle="solid"
      >
        <StyledToggleButton
          value={ThemeMode.LIGHT}
          className={clsx({
            active: themeMode === ThemeMode.LIGHT,
          })}
          aria-label="left aligned"
        >
          <IntlMessages id="customizer.light" />
        </StyledToggleButton>

        <StyledToggleButton
          value={ThemeMode.DARK}
          className={clsx({
            active:
              themeMode === ThemeMode.DARK ||
              theme.palette.type === ThemeMode.DARK,
          })}
          aria-label="centered"
        >
          <IntlMessages id="customizer.dark" />
        </StyledToggleButton>
      </ToggleButtonGroup>
    </StyledThemeColorSetting>
  );
};

export default ThemeModes;
