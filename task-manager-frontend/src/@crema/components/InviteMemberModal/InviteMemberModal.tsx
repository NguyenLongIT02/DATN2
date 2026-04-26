/**
 * INVITE MEMBER MODAL - Component để invite user vào board qua email
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
  Divider,
} from "antd";
import { UserAddOutlined, MailOutlined } from "@ant-design/icons";
import IntlMessages from "@crema/helpers/IntlMessages";
import { invitationService } from "@crema/services/InvitationService";

const { Text } = Typography;

interface InviteMemberModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  boardId: number;
  boardName: string;
  existingMembers?: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

interface InviteFormData {
  email: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  boardId,
  boardName,
  existingMembers = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInvite = async (values: InviteFormData) => {
    setLoading(true);
    try {
      // Check if user is already a member
      const isAlreadyMember = existingMembers.some(
        (member) => member.email.toLowerCase() === values.email.toLowerCase()
      );

      if (isAlreadyMember) {
        setErrorMessage("User is already a member of this board");
        return;
      }

      const response = await invitationService.inviteUserToBoard(
        boardId,
        values.email
      );

      message.success(`Invitation sent to ${values.email} successfully!`);
      form.resetFields();
      setErrorMessage(null);
      onSuccess();
    } catch (error: any) {
      console.error("Invite error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send invitation. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setErrorMessage(null);
    onCancel();
  };

  // Clear error message when modal opens
  useEffect(() => {
    if (visible) {
      setErrorMessage(null);
    }
  }, [visible]);

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          <span>Invite Member to Board</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Invite someone to join <strong>{boardName}</strong>
        </Text>
        {errorMessage && (
          <div style={{ marginTop: 8, color: "#ff4d4f" }}>
            <Text type="danger">{errorMessage}</Text>
          </div>
        )}
      </div>

      <Form form={form} layout="vertical" onFinish={handleInvite}>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Please enter email address" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="user@example.com"
            size="large"
          />
        </Form.Item>

        <Divider />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            <UserAddOutlined />
            Send Invitation
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default InviteMemberModal;
