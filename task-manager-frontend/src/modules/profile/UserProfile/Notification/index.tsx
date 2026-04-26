import { Button, Switch } from "antd";
import IntlMessages from "@crema/helpers/IntlMessages";
import {
  StyledNotificationList,
  StyledNotificationListItem,
  StyledProfileNotification,
  StyledUserProfileForm,
  StyledUserProfileFormTitle,
  StyledUserProfileGroupBtn,
} from "../index.styled";
import { NotificationType } from "@crema/types/models/account";

type NotificationProps = {
  notification: NotificationType;
};

const Notification = ({ notification }: NotificationProps) => {
  const onFinish = (values: any) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  function onChange(checked: boolean) {
    console.log(`switch to ${checked}`);
  }

  return (
    <StyledUserProfileForm
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <StyledProfileNotification className="profile-notification">
        <StyledUserProfileFormTitle>
          <IntlMessages id="userProfile.activity" />
        </StyledUserProfileFormTitle>
        <StyledNotificationList>
          {notification.activity.map((activity, index) => {
            return (
              <StyledNotificationListItem key={index}>
                <Switch
                  defaultChecked={activity.defaultChecked}
                  onChange={onChange}
                />
                <label className="label">{activity.title}</label>
              </StyledNotificationListItem>
            );
          })}
        </StyledNotificationList>
      </StyledProfileNotification>

      <StyledProfileNotification className="profile-notification">
        <StyledUserProfileFormTitle>
          <IntlMessages id="userProfile.application" />
        </StyledUserProfileFormTitle>
        <StyledNotificationList>
          {notification.application.map((application, index: number) => {
            return (
              <StyledNotificationListItem key={index}>
                <Switch
                  defaultChecked={application.defaultChecked}
                  onChange={onChange}
                />
                <label className="label">{application.title}</label>
              </StyledNotificationListItem>
            );
          })}
        </StyledNotificationList>
      </StyledProfileNotification>

      <StyledUserProfileGroupBtn
        shouldUpdate
        className="user-profile-group-btn"
      >
        <Button type="primary" htmlType="submit">
          Save Changes
        </Button>
        <Button>Cancel</Button>
      </StyledUserProfileGroupBtn>
    </StyledUserProfileForm>
  );
};

export default Notification;
