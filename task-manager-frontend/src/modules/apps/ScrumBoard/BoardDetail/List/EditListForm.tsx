import React, { useState } from "react";
import { Form, Input, Select, Button, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Option } = Select;

type EditListFormProps = {
  initialName: string;
  initialStatusType?: string;
  onSave: (name: string, statusType: string) => void;
  onCancel: () => void;
};

const EditListForm: React.FC<EditListFormProps> = ({
  initialName,
  initialStatusType = "NONE",
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const [statusType, setStatusType] = useState(initialStatusType);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave(name.trim(), statusType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div style={{ padding: "8px" }}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Tên danh sách"
        autoFocus
        style={{ marginBottom: 8 }}
      />
      <Select
        value={statusType}
        onChange={setStatusType}
        style={{ width: "100%", marginBottom: 8 }}
      >
        <Option value="NONE">
          <span style={{ color: "#d9d9d9" }}>● </span>None
        </Option>
        <Option value="TODO">
          <span style={{ color: "#1890ff" }}>● </span>To Do
        </Option>
        <Option value="IN_PROGRESS">
          <span style={{ color: "#faad14" }}>● </span>In Progress
        </Option>
        <Option value="DONE">
          <span style={{ color: "#52c41a" }}>● </span>Done
        </Option>
      </Select>
      <Space>
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={handleSubmit}
        >
          Lưu
        </Button>
        <Button size="small" icon={<CloseOutlined />} onClick={onCancel}>
          Hủy
        </Button>
      </Space>
    </div>
  );
};

export default EditListForm;
