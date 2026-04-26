/**
 * INVITE MEMBER MODAL - Component để invite user vào board qua email
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  message,
  Typography,
  Space,
  Divider,
} from "antd";
import { UserAddOutlined, MailOutlined } from "@ant-design/icons";
import { invitationService } from "@crema/services/InvitationService";

const { Text } = Typography;
const { Option } = Select;

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
  userRole?: string;
}

interface InviteFormData {
  email: string;
  roleName: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  boardId,
  boardName,
  existingMembers = [],
  userRole,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // PM có thể chọn Team Lead hoặc Member; Team Lead chỉ mời được Member
  const isPM = userRole === "Project Manager";

  const handleInvite = async (values: InviteFormData) => {
    setLoading(true);
    try {
      const isAlreadyMember = existingMembers.some(
        (member) => member.email.toLowerCase() === values.email.toLowerCase()
      );
      if (isAlreadyMember) {
        setErrorMessage("Người dùng này đã là thành viên của board!");
        setLoading(false);
        return;
      }
      await invitationService.inviteUserToBoard(
        boardId,
        values.email,
        values.roleName || "Member"
      );
      message.success(`Đã gửi lời mời đến ${values.email} thành công!`);
      form.resetFields();
      setErrorMessage(null);
      onSuccess();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Gửi lời mời thất bại. Vui lòng thử lại.";
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

  useEffect(() => {
    if (visible) {
      setErrorMessage(null);
      form.setFieldsValue({ roleName: "Member" });
    }
  }, [visible, form]);

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          <span>Mời thành viên vào Board</span>
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
          Mời người dùng tham gia <strong>{boardName}</strong>
        </Text>
        {errorMessage && (
          <div style={{ marginTop: 8 }}>
            <Text type="danger">{errorMessage}</Text>
          </div>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleInvite}
        initialValues={{ roleName: "Member" }}
      >
        <Form.Item
          name="email"
          label="Địa chỉ Email"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="user@example.com"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="roleName"
          label="Vai trò"
          rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
        >
          <Select size="large" placeholder="Chọn vai trò">
            {isPM && (
              <Option value="Team Lead">
                🎯 Team Lead — Quản lý nhóm, chỉnh sửa board & thẻ
              </Option>
            )}
            <Option value="Member">
              👤 Member — Xem bảng, bình luận & cập nhật checklist
            </Option>
          </Select>
        </Form.Item>

        <Divider />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            <UserAddOutlined />
            Gửi lời mời
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default InviteMemberModal;
