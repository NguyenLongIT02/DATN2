import {
  GithubOutlined,
  GoogleOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Checkbox, Form, Input } from "antd";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";
import { FaFacebookF } from "react-icons/fa";
import { useAuthMethod } from "@crema/hooks/AuthHooks";
import {
  StyledSignedText,
  StyledSignFooter,
  StyledSignIconBtn,
  StyledSignLinkTag,
  StyledSignSocialLink,
  StyledSignUp,
  StyledSignUpBtn,
  StyledSignupCheckBox,
  StyledSignUpContent,
  StyledSignUpForm,
  StyledSignupLink,
  StyledSignUpTestGrey,
} from "./index.styled";
import { SignUpProps } from "@crema/services/auth/firebase/FirebaseAuthProvider";

const SignupFirebase = () => {
  const { messages } = useIntl();
  const { registerUserWithEmailAndPassword, logInWithPopup } = useAuthMethod();

  return (
    <StyledSignUp>
      <StyledSignUpContent>
        <StyledSignUpForm
          name="basic"
          initialValues={{ remember: true }}
          onFinish={(values: any) =>
            registerUserWithEmailAndPassword(values as SignUpProps)
          }
        >
          <Form.Item
            name="name"
            className="form-field"
            rules={[{ required: true, message: "Please input your Name!" }]}
          >
            <Input placeholder={messages["common.name"] as string} />
          </Form.Item>

          <Form.Item
            name="email"
            className="form-field"
            rules={[{ required: true, message: "Please input your Email!" }]}
          >
            <Input placeholder={messages["common.email"] as string} />
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

          <Form.Item
            name="confirmPassword"
            className="form-field"
            rules={[
              {
                required: true,
                message: "Please input your Retype Password!",
              },
            ]}
          >
            <Input.Password
              placeholder={messages["common.retypePassword"] as string}
            />
          </Form.Item>

          <StyledSignupCheckBox
            className="form-field"
            name="iAgreeTo"
            valuePropName="checked"
          >
            <Checkbox>
              <IntlMessages id="common.iAgreeTo" />
            </Checkbox>
            <StyledSignupLink>
              <IntlMessages id="common.termConditions" />
            </StyledSignupLink>
          </StyledSignupCheckBox>

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

      <StyledSignFooter>
        <StyledSignedText>
          <IntlMessages id="auth.orSignupWith" />
        </StyledSignedText>

        <StyledSignSocialLink>
          <StyledSignIconBtn
            shape="circle"
            onClick={() => logInWithPopup("google")}
            icon={<GoogleOutlined />}
          />
          <StyledSignIconBtn
            shape="circle"
            onClick={() => logInWithPopup("facebook")}
            icon={<FaFacebookF />}
          />
          <StyledSignIconBtn
            shape="circle"
            icon={<GithubOutlined />}
            onClick={() => logInWithPopup("github")}
          />
          <StyledSignIconBtn
            shape="circle"
            icon={<TwitterOutlined />}
            onClick={() => logInWithPopup("twitter")}
          />
        </StyledSignSocialLink>
      </StyledSignFooter>
    </StyledSignUp>
  );
};

export default SignupFirebase;
