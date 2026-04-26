import ReactCodeInput from "react-code-input";
import { Form, Input } from "antd";
import IntlMessages from "@crema/helpers/IntlMessages";
import useIntl from "react-intl/lib/src/components/useIntl";
import {
  StyledAuthReconContent,
  StyledConfirmBtn,
  StyledResetForm,
} from "../AuthWrapper.styled";

const ResetPasswordAwsCognito = () => {
  const { messages } = useIntl();

  const onFinish = (values: any) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <StyledAuthReconContent>
      <StyledResetForm
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="pin"
          className="form-field"
          rules={[{ required: true, message: "Please input your Pin!" }]}
        >
          <p>
            <IntlMessages id="common.verificationMessage" />
          </p>

          <ReactCodeInput
            type="password"
            fields={6}
            inputMode="numeric"
            name="pin"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          className="form-field"
          rules={[
            { required: true, message: "Please input your New Password!" },
          ]}
        >
          <Input
            type="password"
            placeholder={messages["common.newPassword"] as string}
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
          <Input
            type="password"
            placeholder={messages["common.retypePassword"] as string}
          />
        </Form.Item>

        <StyledConfirmBtn type="primary" htmlType="submit">
          <IntlMessages id="common.resetMyPassword" />
        </StyledConfirmBtn>
      </StyledResetForm>
    </StyledAuthReconContent>
  );
};

export default ResetPasswordAwsCognito;
