import { Badge, Dropdown } from "antd";
import IntlMessages from "@crema/helpers/IntlMessages";
import NotificationItem from "./NotificationItem";
import { IoIosNotificationsOutline } from "react-icons/io";
import {
  StyledDrowdownWrapper,
  StyledNotifyButtonAll,
  StyledNotifyIcon,
  StyledNotifyLink,
  StyledNotifyList,
  StyledNotifyScrollSubmenu,
  StyledNotifyText,
} from "./index.styled";
import { useNotificationContext } from "../../../modules/apps/context/NotificationContextProvider";

const AppNotifications = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotificationContext();

  const items = [
    {
      key: 1,
      label: (
        <span className="header">
          <IntlMessages id="common.notifications" />({notifications.length})
        </span>
      ),
    },
    {
      key: 2,
      label: (
        <StyledNotifyScrollSubmenu>
          <StyledNotifyList
            dataSource={notifications}
            renderItem={(item: any) => {
              return <NotificationItem key={item.id || Math.random()} item={item} />;
            }}
          />
        </StyledNotifyScrollSubmenu>
      ),
    },
    {
      key: 3,
      label: (
        <StyledNotifyButtonAll type="primary" onClick={markAllAsRead}>
          <IntlMessages id="common.viewAll" />
        </StyledNotifyButtonAll>
      ),
    },
  ];

  return (
    <StyledDrowdownWrapper>
      <Dropdown
        menu={{ items }}
        className="dropdown"
        overlayClassName="header-notify-messages"
        getPopupContainer={(triggerNode) => triggerNode}
        trigger={["click"]}
      >
        <StyledNotifyLink onClick={(e) => e.preventDefault()}>
          <StyledNotifyIcon>
            <Badge count={unreadCount} dot={unreadCount > 0}>
              <IoIosNotificationsOutline />
            </Badge>
          </StyledNotifyIcon>
          <StyledNotifyText>
            <IntlMessages id="common.notifications" />
          </StyledNotifyText>
        </StyledNotifyLink>
      </Dropdown>
    </StyledDrowdownWrapper>
  );
};

export default AppNotifications;
