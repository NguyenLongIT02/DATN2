import { useNavigate } from "react-router-dom";
import { Checkbox, Form, Input } from "antd";
import {
  GithubOutlined,
  GoogleOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { FaFacebookF } from "react-icons/fa";
import { useIntl } from "react-intl";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useAuthMethod } from "@crema/hooks/AuthHooks";
import {
  SignInButton,
  StyledRememberMe,
  StyledSign,
  StyledSignContent,
  StyledSignedText,
  StyledSignFooter,
  StyledSignForm,
  StyledSignIconBtn,
  StyledSignLink,
  StyledSignLinkTag,
  StyledSignSocialLink,
  StyledSignTextGrey,
} from "./index.styled";
import { SignInProps } from "@crema/services/auth/firebase/FirebaseAuthProvider";

const SignInFirebase = () => {
  const navigate = useNavigate();
  const { logInWithEmailAndPassword, logInWithPopup } = useAuthMethod();
  const { messages } = useIntl();

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  const onGoToForgetPassword = () => {
    navigate("/forget-password");
  };

  function onRememberMe() {
    console.log(`checked`);
  }

  return (
    <StyledSign>
      <StyledSignContent>
        <StyledSignForm
          name="basic"
          initialValues={{
            remember: true,
            email: "crema.demo@gmail.com",
            password: "Pass@1!@all",
          }}
          onFinish={(values) =>
            logInWithEmailAndPassword(values as SignInProps)
          }
          onFinishFailed={onFinishFailed}
        >
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

      <StyledSignFooter>
        <StyledSignedText>
          <IntlMessages id="common.orLoginWith" />
        </StyledSignedText>
        <StyledSignSocialLink>
          <StyledSignIconBtn
            onClick={() => logInWithPopup("google")}
            icon={<GoogleOutlined />}
          />
          <StyledSignIconBtn
            icon={<FaFacebookF />}
            onClick={() => logInWithPopup("facebook")}
          />
          <StyledSignIconBtn
            icon={<GithubOutlined />}
            onClick={() => logInWithPopup("github")}
          />
          <StyledSignIconBtn
            icon={<TwitterOutlined />}
            onClick={() => logInWithPopup("twitter")}
          />
        </StyledSignSocialLink>
      </StyledSignFooter>
    </StyledSign>
  );
};

export default SignInFirebase;
