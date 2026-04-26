import clsx from "clsx";
import AppVerticalMenu from "../components/AppVerticalNav";
import { useSidebarContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import {
  StyledUserHeaderSidebar,
  StyledUserSidebarScrollbar,
} from "./index.styled";
import { RouterConfigData } from "@crema/types/models/Apps";

type AppSidebarProps = {
  isCollapsed: boolean;
  routesConfig: RouterConfigData[];
};

const AppSidebar = ({isCollapsed, routesConfig}: AppSidebarProps) => {
  const {allowSidebarBgImage} = useSidebarContext();

  return (
    <StyledUserHeaderSidebar
      className={clsx({
        'userHeader-sidebar-img-background': allowSidebarBgImage,
      })}
      collapsible
      breakpoint='xl'
      collapsed={isCollapsed}
    >
      <StyledUserSidebarScrollbar scrollToTop={false}>
        <AppVerticalMenu routesConfig={routesConfig} />
      </StyledUserSidebarScrollbar>
    </StyledUserHeaderSidebar>
  );
};

export default AppSidebar;
