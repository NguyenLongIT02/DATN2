import { Checkbox, Form, Input, message } from "antd";
import { useEffect } from "react";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useAuthMethod } from "@crema/hooks/AuthHooks";
import { useIntl } from "react-intl";
import {
  handleInvitationOnPageLoad,
  processPendingInvitation,
} from "@crema/helpers/InvitationHelper";
import {
  StyledSignLinkTag,
  StyledSignUp,
  StyledSignUpBtn,
  StyledSignUpContent,
  StyledSignUpForm,
  StyledSignupLink,
  StyledSignUpTestGrey,
} from "./index.styled";

interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  iAgreeTo: boolean;
}

const SignupJwtAuth = () => {
  const { signUpUser } = useAuthMethod();
  const { messages } = useIntl();

  // Xử lý invitation từ URL khi component mount
  useEffect(() => {
    handleInvitationOnPageLoad();
  }, []);

  const onFinishFailed = (errorInfo: unknown) => {
    console.log("Failed:", errorInfo);
    message.error(messages["validation.signupFailed"] as string);
  };

  const onFinish = async (values: unknown) => {
    const formValues = values as SignupFormData;
    try {
      // Call signup with proper field mapping
      await signUpUser({
        name: formValues.full_name, // Use full_name as name
        email: formValues.email,
        password: formValues.password,
        username: formValues.username, // Pass username separately
        full_name: formValues.full_name, // Pass full_name separately
      });

      // Xử lý pending invitation sau khi signup thành công
      console.log("Signup successful, checking for pending invitation...");
      const invitationProcessed = await processPendingInvitation({});

      if (!invitationProcessed) {
        // Normal redirect nếu không có invitation
        console.log("No pending invitation, redirecting to dashboard");
        // Redirect sẽ được xử lý bởi auth provider
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <StyledSignUp>
      <StyledSignUpContent>
        <StyledSignUpForm
          name="signup"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="username"
            className="form-field"
            rules={[
              {
                required: true,
                message: messages["validation.usernameRequired"] as string,
              },
              {
                min: 4,
                max: 20,
                message: messages["validation.usernameSize"] as string,
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: messages["validation.usernamePattern"] as string,
              },
            ]}
          >
            <Input placeholder={messages["common.username"] as string} />
          </Form.Item>

          <Form.Item
            name="email"
            className="form-field"
            rules={[
              {
                required: true,
                message: messages["validation.emailRequired"] as string,
              },
              {
                type: "email",
                message: messages["validation.emailFormat"] as string,
              },
            ]}
          >
            <Input placeholder={messages["common.email"] as string} />
          </Form.Item>

          <Form.Item
            name="full_name"
            className="form-field"
            rules={[
              {
                required: true,
                message: messages["validation.nameRequired"] as string,
              },
            ]}
          >
            <Input placeholder={messages["common.fullName"] as string} />
          </Form.Item>

          <Form.Item
            name="password"
            className="form-field"
            rules={[
              {
                required: true,
                message: messages["validation.passwordRequired"] as string,
              },
              {
                pattern: /\S+/,
                message: messages["validation.passwordNoSpace"] as string,
              },
            ]}
          >
            <Input.Password
              placeholder={messages["common.password"] as string}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            className="form-field"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: messages["validation.reTypePassword"] as string,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(messages["validation.passwordMisMatch"] as string)
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={messages["common.retypePassword"] as string}
            />
          </Form.Item>

          <Form.Item
            name="iAgreeTo"
            className="form-field"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          messages["validation.termsRequired"] as string
                        )
                      ),
              },
            ]}
          >
            <div>
              <Checkbox>
                <IntlMessages id="common.iAgreeTo" />
                <StyledSignupLink>
                  <IntlMessages id="common.termConditions" />
                </StyledSignupLink>
              </Checkbox>
            </div>
          </Form.Item>

          <div className="form-btn-field">
            <StyledSignUpBtn type="primary" htmlType="submit">
              <IntlMessages id="common.signup" />
            </StyledSignUpBtn>
          </div>

          <div className="form-field-action">
            <StyledSignUpTestGrey>
              <IntlMessages id="common.alreadyHaveAccount" />
            </StyledSignUpTestGrey>
            <StyledSignLinkTag to="/signIn">
              <IntlMessages id="common.signIn" />
            </StyledSignLinkTag>
          </div>
        </StyledSignUpForm>
      </StyledSignUpContent>
    </StyledSignUp>
  );
};

export default SignupJwtAuth;
