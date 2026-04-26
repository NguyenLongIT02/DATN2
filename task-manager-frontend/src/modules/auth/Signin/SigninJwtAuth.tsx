import { useNavigate } from "react-router-dom";
import { useIntl } from "react-intl";
import { useEffect } from "react";
import { Checkbox, Form, Input } from "antd";

import IntlMessages from "@crema/helpers/IntlMessages";
import { useAuthMethod } from "@crema/hooks/AuthHooks";
import { getDeviceId } from "@crema/utils/deviceUtils";
import {
  handleInvitationOnPageLoad,
  processPendingInvitation,
} from "@crema/helpers/InvitationHelper";
import {
  SignInButton,
  StyledRememberMe,
  StyledSign,
  StyledSignContent,
  StyledSignForm,
  StyledSignLink,
  StyledSignLinkTag,
  StyledSignTextGrey,
} from "./index.styled";

const SignInJwtAuth = () => {
  const navigate = useNavigate();
  const { signInUser } = useAuthMethod();

  // Xử lý invitation từ URL khi component mount
  useEffect(() => {
    handleInvitationOnPageLoad();
  }, []);

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const handleSignIn = async (values: any) => {
    try {
      // Always get device ID for every login
      const deviceId = getDeviceId();
      let signInData = { ...values, deviceId };

      console.log("Sending device ID with login:", deviceId);

      // Call signInUser
      await signInUser(signInData);

      // Xử lý pending invitation sau khi login thành công
      console.log("Login successful, checking for pending invitation...");
      const invitationProcessed = await processPendingInvitation({});

      if (!invitationProcessed) {
        // Normal redirect nếu không có invitation
        console.log("No pending invitation, redirecting to dashboard");
        // Redirect sẽ được xử lý bởi auth provider
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const onGoToForgetPassword = () => {
    navigate("/forget-password", { tab: "jwtAuth" });
  };

  function onRememberMe(e: any) {
    console.log(`checked = ${e.target.checked}`);
  }

  const { messages } = useIntl();

  return (
    <StyledSign>
      <StyledSignContent>
        <StyledSignForm
          name="basic"
          initialValues={{
            remember: true,
            username: "crema.demo@gmail.com",
            password: "Pass@1!@all",
          }}
          onFinish={handleSignIn}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="username"
            className="form-field"
            rules={[
              { required: true, message: "Vui lòng nhập Username hoặc Email!" },
              {
                pattern: /^[a-zA-Z0-9@._-]+$/,
                message: "Username hoặc Email không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Username hoặc Email" />
          </Form.Item>

          <Form.Item
            name="password"
            className="form-field"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              placeholder={messages["common.password"] as string}
            />
          </Form.Item>

          <StyledRememberMe>
            <Checkbox onChange={onRememberMe}>
              <IntlMessages id="common.rememberMe" />
            </Checkbox>

            <StyledSignLink onClick={onGoToForgetPassword}>
              <IntlMessages id="common.forgetPassword" />
            </StyledSignLink>
          </StyledRememberMe>

          <div className="form-btn-field">
            <SignInButton type="primary" htmlType="submit">
              <IntlMessages id="common.login" />
            </SignInButton>
          </div>

          <div className="form-field-action">
            <StyledSignTextGrey>
              <IntlMessages id="common.dontHaveAccount" />
            </StyledSignTextGrey>
            <StyledSignLinkTag to="/signup">
              <IntlMessages id="common.signup" />
            </StyledSignLinkTag>
          </div>
        </StyledSignForm>
      </StyledSignContent>
    </StyledSign>
  );
};

export default SignInJwtAuth;
