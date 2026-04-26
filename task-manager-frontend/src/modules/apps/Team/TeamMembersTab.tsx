import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Input,
  Select,
  message,
  Modal,
  Table,
  Avatar,
  Tag,
} from "antd";
import { SearchOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import {
  TeamMember,
  TeamRole,
  BoardMember,
} from "@crema/services/PermissionService";
import { boardMemberService } from "@crema/services/BoardMemberService";
import {
  getRoleIcon,
  getRoleColor,
  getRoleDisplayName,
} from "@crema/helpers/roleUtils";
import MemberCard from "./TeamContent/MemberCard";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppScrollbar from "@crema/components/AppScrollbar";
import InviteMemberModal from "@crema/components/InviteMemberModal";
import { useIntl } from "react-intl";

const { Search } = Input;
const { Option } = Select;

interface TeamMembersTabProps {
  boardId?: number;
  boardName?: string;
}

const TeamMembersTab: React.FC<TeamMembersTabProps> = ({
  boardId,
  boardName,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "all">("all");
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const { messages } = useIntl();

  // Mock current user role - trong thực tế sẽ lấy từ context/auth
  const currentUserRole = "PM";

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Always load all team members for dropdown
      const allMembers = await boardMemberService.getAllTeamMembers();
      setAllTeamMembers(allMembers);

      if (boardId) {
        // Load board members nếu có boardId
        const data = await boardMemberService.getBoardMembers(boardId);
        setBoardMembers(data);
        // Extract team members from board members
        const teamMembers = data.map((bm) => bm.member);
        setMembers(teamMembers);
      } else {
        // Load all team members nếu không có boardId
        setMembers(allMembers);
      }
    } catch (error) {
      message.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [boardId]);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setLoading(true);
      try {
        const results = await boardMemberService.searchTeamMembers(value);
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

  const handleRoleFilter = (value: string | "all") => {
    setRoleFilter(value);
    if (value === "all") {
      loadMembers();
    } else {
      const filtered = members.filter((member) => member.role === value);
      setMembers(filtered);
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
    { value: "PM", label: `${getRoleIcon("PM")} Project Manager` },
    { value: "TEAM_LEAD", label: `${getRoleIcon("TEAM_LEAD")} Team Lead` },
    { value: "MEMBER", label: `${getRoleIcon("MEMBER")} Member` },
  ];

  const columns = [
    {
      title: messages["team.member"] as string,
      dataIndex: "name",
      key: "name",
      render: (name: string, record: TeamMember) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: messages["team.role"] as string,
      dataIndex: "role",
      key: "role",
      render: (role: TeamRole | string) => (
        <Tag color={getRoleColor(role)}>
          {getRoleIcon(role)} {getRoleDisplayName(role)}
        </Tag>
      ),
    },
    {
      title: messages["team.joined"] as string,
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (date: string) => {
        if (!date) return "N/A";
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime())
          ? "Invalid Date"
          : parsedDate.toLocaleDateString();
      },
    },
  ];

  // Show message if no board selected
  if (!boardId) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h2><IntlMessages id="team.noBoardSelected" /></h2>
        <p style={{ color: "#666" }}>
          <IntlMessages id="team.noBoardSelectedDescription" />
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Fixed Header */}
      <div style={{ padding: "24px 24px 0 24px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <h2><IntlMessages id="team.teamMembers" /> - {boardName || `Board #${boardId}`}</h2>
            <p style={{ margin: 0, color: "#666" }}>
              <IntlMessages id="team.manageTeamMembers" />
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={() => setIsInviteModalVisible(true)}
              disabled={!boardId || currentUserRole !== "PM"}
            >
              <IntlMessages id="team.inviteMember" />
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            alignItems: "center",
          }}
        >
          <Search
            placeholder={messages["team.searchMembers"] as string}
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder={messages["team.filterByRole"] as string}
            style={{ width: 200 }}
            value={roleFilter}
            onChange={handleRoleFilter}
          >
            <Option value="all"><IntlMessages id="team.allRoles" /></Option>
            {roleOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        style={{
          height: "calc(100vh - 350px)",
          overflow: "auto",
          padding: "0 24px 24px 24px",
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
        }}
      >
        <div>
          {/* Table View */}
          <div style={{ marginBottom: 32 }}>
            <Table
              columns={columns}
              dataSource={filteredMembers}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} members`,
              }}
            />
          </div>

          {/* Card View */}
          <div>
            <h3 style={{ marginBottom: 16 }}><IntlMessages id="team.cardView" /></h3>
            <Row gutter={[16, 16]}>
              {filteredMembers.map((member) => (
                <Col key={member.id} xs={24} sm={12} lg={8} xl={6}>
                  <MemberCard
                    member={member}
                    currentUserRole={currentUserRole}
                    onMemberUpdate={loadMembers}
                    boardId={boardId}
                  />
                </Col>
              ))}
            </Row>
          </div>

          {/* Additional content to test scrolling */}
          <div
            style={{
              marginTop: 32,
              padding: 24,
              backgroundColor: "#f0f8ff",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 16 }}><IntlMessages id="team.teamStatistics" /></h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center", padding: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {filteredMembers.length}
                  </div>
                  <div style={{ color: "#666" }}><IntlMessages id="team.totalMembers" /></div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center", padding: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {
                      filteredMembers.filter(
                        (m) =>
                          m.role === TeamRole.TEAM_LEAD || m.role === TeamRole.PM
                      ).length
                    }
                  </div>
                  <div style={{ color: "#666" }}><IntlMessages id="team.teamLeads" /></div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: "center", padding: 16 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#faad14",
                    }}
                  >
                    {
                      filteredMembers.filter((m) => m.role === TeamRole.MEMBER)
                        .length
                    }
                  </div>
                  <div style={{ color: "#666" }}><IntlMessages id="team.members" /></div>
                </div>
              </Col>
            </Row>
          </div>

          {/* More content to ensure scrolling */}
          <div
            style={{
              marginTop: 24,
              padding: 24,
              backgroundColor: "#f6ffed",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Recent Activity</h3>
            <div style={{ maxHeight: 200, overflow: "auto" }}>
              <div
                style={{ padding: "8px 0", borderBottom: "1px solid #e8e8e8" }}
              >
                <strong>John Doe</strong> joined the team as Owner
                <span style={{ color: "#666", float: "right" }}>
                  2 hours ago
                </span>
              </div>
              <div
                style={{ padding: "8px 0", borderBottom: "1px solid #e8e8e" }}
              >
                <strong>Joe Root</strong> was promoted to Admin
                <span style={{ color: "#666", float: "right" }}>1 day ago</span>
              </div>
              <div
                style={{ padding: "8px 0", borderBottom: "1px solid #e8e8e" }}
              >
                <strong>Johnson</strong> completed 5 tasks
                <span style={{ color: "#666", float: "right" }}>
                  2 days ago
                </span>
              </div>
              <div
                style={{ padding: "8px 0", borderBottom: "1px solid #e8e8e" }}
              >
                <strong>Monty Panesar</strong> updated profile
                <span style={{ color: "#666", float: "right" }}>
                  3 days ago
                </span>
              </div>
              <div
                style={{ padding: "8px 0", borderBottom: "1px solid #e8e8e" }}
              >
                <strong>Sarah Wilson</strong> joined the team as Member
                <span style={{ color: "#666", float: "right" }}>
                  1 week ago
                </span>
              </div>
              <div
                style={{ padding: "8px 0", borderBottom: "1px solid #e8e8e" }}
              >
                <strong>Mike Johnson</strong> was assigned to new board
                <span style={{ color: "#666", float: "right" }}>
                  1 week ago
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 24,
              backgroundColor: "#fff2e8",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Team Performance</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: "white",
                    borderRadius: 8,
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0" }}>
                    📈 Task Completion Rate
                  </h4>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    87%
                  </div>
                  <div style={{ color: "#666" }}>Above team average</div>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: 16,
                    backgroundColor: "white",
                    borderRadius: 8,
                  }}
                >
                  <h4 style={{ margin: "0 0 8px 0" }}>
                    ⏱️ Average Response Time
                  </h4>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    2.3h
                  </div>
                  <div style={{ color: "#666" }}>Within SLA</div>
                </div>
              </Col>
            </Row>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 24,
              backgroundColor: "#fff7e6",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: 16,
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                  }}
                >
                  <h4>📊 Export Team Data</h4>
                  <p style={{ color: "#666", margin: 0 }}>
                    Export team member list and their roles to CSV or Excel
                    format.
                  </p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: 16,
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                  }}
                >
                  <h4>📧 Send Invitations</h4>
                  <p style={{ color: "#666", margin: 0 }}>
                    Send email invitations to new team members with role
                    assignments.
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {boardId && (
        <InviteMemberModal
          visible={isInviteModalVisible}
          onCancel={() => setIsInviteModalVisible(false)}
          onSuccess={() => {
            setIsInviteModalVisible(false);
            loadMembers(); // Refresh members list
          }}
          boardId={boardId}
          boardName={boardName || `Board #${boardId}`}
          existingMembers={boardMembers.map((bm) => ({
            id: bm.memberId,
            name: bm.member?.name || "",
            email: bm.member?.email || "",
          }))}
        />
      )}
    </div>
  );
};

export default TeamMembersTab;
