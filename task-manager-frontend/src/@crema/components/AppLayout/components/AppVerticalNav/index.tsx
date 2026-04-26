import React, { useEffect, useState } from "react";
import { getRouteMenus } from "./VerticalMenuUtils";
import clsx from "clsx";
import defaultConfig from "@crema/constants/defaultConfig";
import { useSidebarContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import { MenuStyle } from "@crema/constants/AppEnums";
import { StyledVerticalNav } from "./index.styled";
import { useLocation } from "react-router-dom";
import { RouterConfigData } from "@crema/types/models/Apps";
import { useIntl } from "react-intl";

type Props = {
  routesConfig: RouterConfigData[];
};

const AppVerticalNav: React.FC<Props> = ({ routesConfig }) => {
  const { menuStyle, sidebarColorSet } = useSidebarContext();

  const { pathname } = useLocation();
  const selectedKeys = pathname.substr(1);
  const [openKeys, setOpenKeys] = useState([selectedKeys[0]]);
  const defaultOpenKeys = selectedKeys?.split("/")[1];
  useEffect(() => {
    // setOpenKeys([selectedKeys[selectedKeys.length - 2]]);
    if (pathname && document.getElementById(pathname)) {
      setTimeout(() => {
        document
          .getElementById(pathname)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 1);
    }
  }, []);

  const onOpenChange = (keys: string[]) => {
    const latestOpenKey = keys.find(
      (key: string) => openKeys.indexOf(key) === -1,
    );
    setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
  };

  const { messages } = useIntl();

  return (
    <StyledVerticalNav
      theme={sidebarColorSet}
      color={sidebarColorSet?.sidebarMenuSelectedTextColor}
      // bgcolor={sidebarColorSet?.sidebarMenuSelectedBgColor}
      mode="inline"
      className={clsx({
        "rounded-menu": menuStyle === MenuStyle.ROUNDED,
        "rounded-menu-reverse": menuStyle === MenuStyle.ROUNDED_REVERSE,
        "standard-menu": menuStyle === MenuStyle.STANDARD,
        "default-menu": menuStyle === MenuStyle.DEFAULT,
        "rounded-menu curved-menu": menuStyle === MenuStyle.CURVED_MENU,
        "menu-rounded": menuStyle === MenuStyle.ROUNDED,
        "menu-rounded rounded-menu-reverse":
          menuStyle === MenuStyle.ROUNDED_REVERSE,
        "menu-rounded standard-menu": menuStyle === MenuStyle.STANDARD,
        "menu-rounded curved-menu": menuStyle === MenuStyle.CURVED_MENU,
        "bg-color-menu":
          sidebarColorSet.sidebarBgColor !==
          defaultConfig.sidebar.colorSet.sidebarBgColor,
      })}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      selectedKeys={selectedKeys.split("/")}
      defaultOpenKeys={[defaultOpenKeys]} /*
      selectedKeys={[selectedKeys[selectedKeys.length - 1]]}
      defaultSelectedKeys={[selectedKeys[selectedKeys.length - 1]]}*/
      items={getRouteMenus(routesConfig, messages)}
    />
  );
};

export default AppVerticalNav;
