import collapseMotion from "antd/lib/_util/motion";
import clsx from "clsx";
import AppVerticalMenu from "../components/AppVerticalNav";
import { useSidebarContext } from "@crema/context/AppContextProvider/SidebarContextProvider";
import { StyledAppScrollBarMini, StyledUserMiniSidebar } from "./index.styled";
import { RouterConfigData } from "@crema/types/models/Apps";

type Props = {
  routesConfig: RouterConfigData[];
};

const AppSidebar = ({routesConfig}: Props) => {
  const {allowSidebarBgImage} = useSidebarContext();

  return (
    <StyledUserMiniSidebar
      className={clsx({
        'userMiniHeader-sidebar-img-background': allowSidebarBgImage,
      })}
      breakpoint='lg'
      collapsed={collapseMotion}
    >
      <StyledAppScrollBarMini scrollToTop={false}>
        <AppVerticalMenu routesConfig={routesConfig} />
      </StyledAppScrollBarMini>
    </StyledUserMiniSidebar>
  );
};

export default AppSidebar;
