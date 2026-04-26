import React, { useEffect, useState } from "react";
import { Row, Col, Button, Input, Select, message, Modal, Form } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import AppScrollbar from "@crema/components/AppScrollbar";
import MemberCard from "./MemberCard";
import {
  StyledTeamContent,
  StyledTeamHeader,
  StyledTeamActions,
} from "./index.styled";
import IntlMessages from "@crema/helpers/IntlMessages";
import { TeamMember, TeamRole } from "@crema/services/PermissionService";
import { TeamService } from "@crema/mockapi/apis/team";
import { getRoleIcon } from "@crema/helpers/roleUtils";

const { Search } = Input;
const { Option } = Select;

const TeamContent = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<TeamRole | "all">("all");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Mock current user role - trong thực tế sẽ lấy từ context/auth
  const currentUserRole = TeamRole.OWNER;

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await TeamService.getTeamMembers();
      setMembers(data);
    } catch (error) {
      message.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setLoading(true);
      try {
        const results = await TeamService.searchMembers(value);
        setMembers(results);
      } catch (error) {
        message.error("Search failed");
      } finally {
        setLoading(false);
      }
    } else {
      loadMembers();
    }
  };

  const handleRoleFilter = (value: TeamRole | "all") => {
    setRoleFilter(value);
    if (value === "all") {
      loadMembers();
    } else {
      const filtered = members.filter((member) => member.role === value);
      setMembers(filtered);
    }
  };

  const handleAddMember = async (values: any) => {
    try {
      await TeamService.addTeamMember({
        name: values.name,
        email: values.email,
        avatar: values.avatar || "/assets/images/avatar/default.jpg",
        role: values.role,
        boards: 0,
        tasks: 0,
      });
      message.success("Member added successfully");
      setIsAddModalVisible(false);
      form.resetFields();
      loadMembers();
    } catch (error) {
      message.error("Failed to add member");
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const roleOptions = [
    { value: TeamRole.PM, label: `${getRoleIcon(TeamRole.PM)} Project Manager` },
    { value: TeamRole.TEAM_LEAD, label: `${getRoleIcon(TeamRole.TEAM_LEAD)} Team Lead` },
    { value: TeamRole.MEMBER, label: `${getRoleIcon(TeamRole.MEMBER)} Member` },
    { value: TeamRole.VIEWER, label: `${getRoleIcon(TeamRole.VIEWER)} Viewer` },
  ];

  return (
    <StyledTeamContent>
      <StyledTeamHeader>
        <div>
          <h2>
            <IntlMessages id="sidebar.apps.team" />
          </h2>
          <p>Manage your team members and their permissions</p>
        </div>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsAddModalVisible(true)}
          disabled={
            currentUserRole !== TeamRole.PM &&
            currentUserRole !== TeamRole.TEAM_LEAD
          }
        >
          Add Member
        </Button>
      </StyledTeamHeader>

      <StyledTeamActions>
        <Search
          placeholder="Search members..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="Filter by role"
          style={{ width: 200 }}
          value={roleFilter}
          onChange={handleRoleFilter}
        >
          <Option value="all">All Roles</Option>
          {roleOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </StyledTeamActions>

      <AppScrollbar style={{ height: "calc(100vh - 300px)" }}>
        <Row gutter={[16, 16]}>
          {filteredMembers.map((member) => (
            <Col key={member.id} xs={24} sm={12} lg={8} xl={6}>
              <MemberCard
                member={member}
                currentUserRole={currentUserRole}
                onMemberUpdate={loadMembers}
              />
            </Col>
          ))}
        </Row>
      </AppScrollbar>

      <Modal
        title="Add New Member"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddMember}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter member name" }]}
          >
            <Input placeholder="Enter member name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
            initialValue={TeamRole.MEMBER}
          >
            <Select placeholder="Select role">
              {roleOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="avatar" label="Avatar URL (Optional)">
            <Input placeholder="Enter avatar URL" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              onClick={() => setIsAddModalVisible(false)}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Add Member
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </StyledTeamContent>
  );
};

export default TeamContent;
