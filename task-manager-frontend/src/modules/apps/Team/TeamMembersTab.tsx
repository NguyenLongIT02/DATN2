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
  Tooltip,
} from "antd";
import { SearchOutlined, UserOutlined, MailOutlined, FilePdfOutlined, EyeOutlined } from "@ant-design/icons";
import { exportMembersToPdf } from "@crema/helpers/exportMembersPdf";
import MemberProgressModal from "@crema/components/MemberProgressModal";
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
import { useAuthUser } from "@crema/hooks/AuthHooks";

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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isProgressModalVisible, setIsProgressModalVisible] = useState(false);
  const { messages } = useIntl();
  const { user } = useAuthUser();

  // Extract user email from JWT token directly since useAuthUser might be empty on refresh
  const getEmailFromToken = () => {
    if (user?.email) return user.email;
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        // Parse JWT payload safely
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        return payload.sub || payload.username || payload.email;
      }
    } catch (e) {
      console.error("Failed to parse token", e);
    }
    return null;
  };

  const userEmail = getEmailFromToken();

  // Find current user's role in the board
  const currentUserBoardMember = boardMembers.find((bm) => {
    // Match exact username, email, or name
    if (bm.member?.email === userEmail || bm.member?.username === userEmail || bm.member?.name === userEmail) {
      return true;
    }
    // Fallback cho tài khoản demo: JWT trả về 'nguyenlong' nhưng email trên list là 'vinhlongnguyen0210@gmail.com'
    if (userEmail === 'nguyenlong' && bm.member?.email === 'vinhlongnguyen0210@gmail.com') {
      return true;
    }
    return false;
  });
  
  // Ánh xạ chuỗi role từ backend sang TeamRole format để dùng trong UI
  let currentUserRole = "VIEWER";
  if (currentUserBoardMember?.role === "Project Manager") {
    currentUserRole = "PM";
  } else if (currentUserBoardMember?.role === "Team Lead") {
    currentUserRole = "TEAM_LEAD";
  } else if (currentUserBoardMember?.role === "Member") {
    currentUserRole = "MEMBER";
  }

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleRoleFilter = (value: string | "all") => {
    setRoleFilter(value);
  };

  const filteredMembers = members
    .filter((member) => {
      const matchesSearch =
        !searchQuery ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Normalize role for comparison
      let normalizedMemberRole = member.role;
      if (member.role === "Project Manager") normalizedMemberRole = "PM";
      else if (member.role === "Team Lead") normalizedMemberRole = "TEAM_LEAD";
      else if (member.role === "Member") normalizedMemberRole = "MEMBER";

      const matchesRole = roleFilter === "all" || normalizedMemberRole === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const roleOrder: Record<string, number> = {
        "Project Manager": 1,
        "PM": 1,
        "Team Lead": 2,
        "TEAM_LEAD": 2,
        "Member": 3,
        "MEMBER": 3,
      };

      const orderA = roleOrder[a.role || "Member"] || 4;
      const orderB = roleOrder[b.role || "Member"] || 4;

      return orderA - orderB;
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
    ...(boardId
      ? [
          {
            title: "Tiến độ",
            key: "action",
            render: (_: unknown, record: TeamMember) => (
              <Tooltip title="Xem tiến độ công việc">
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedMember(record);
                    setIsProgressModalVisible(true);
                  }}
                >
                  Xem tiến độ
                </Button>
              </Tooltip>
            ),
          },
        ]
      : []),
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
            <Tooltip title="Xuất danh sách thành viên ra PDF">
              <Button
                icon={<FilePdfOutlined />}
                onClick={async () => {
                  await exportMembersToPdf(
                    filteredMembers,
                    boardName || `Board #${boardId}`,
                    boardId
                  );
                }}
                disabled={filteredMembers.length === 0}
              >
                Xuất PDF
              </Button>
            </Tooltip>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={() => setIsInviteModalVisible(true)}
              disabled={!boardId || (currentUserRole !== "PM" && currentUserRole !== "TEAM_LEAD")}
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
            onChange={(e) => handleSearch(e.target.value)}
            value={searchQuery}
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
                  <div style={{ position: "relative" }}>
                    <MemberCard
                      member={member}
                      currentUserRole={currentUserRole}
                      onMemberUpdate={loadMembers}
                      boardId={boardId}
                    />
                    {/* Nút xem tiến độ overlay */}
                    {boardId && (
                      <Tooltip title="Xem tiến độ công việc">
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          style={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                            borderRadius: 20,
                            fontSize: 12,
                          }}
                          onClick={() => {
                            setSelectedMember(member);
                            setIsProgressModalVisible(true);
                          }}
                        >
                          Tiến độ
                        </Button>
                      </Tooltip>
                    )}
                  </div>
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
                      filteredMembers.filter((m) => {
                        const normalizedRole = m.role === "Project Manager" ? "PM" : 
                                              m.role === "Team Lead" ? "TEAM_LEAD" : 
                                              m.role === "Member" ? "MEMBER" : m.role;
                        return normalizedRole === "TEAM_LEAD" || normalizedRole === "PM";
                      }).length
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
                      filteredMembers.filter((m) => {
                        const normalizedRole = m.role === "Project Manager" ? "PM" : 
                                              m.role === "Team Lead" ? "TEAM_LEAD" : 
                                              m.role === "Member" ? "MEMBER" : m.role;
                        return normalizedRole === "MEMBER";
                      }).length
                    }
                  </div>
                  <div style={{ color: "#666" }}><IntlMessages id="team.members" /></div>
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
          userRole={currentUserBoardMember?.role || ""}
          existingMembers={boardMembers.map((bm) => ({
            id: bm.memberId,
            name: bm.member?.name || "",
            email: bm.member?.email || "",
          }))}
        />
      )}

      {/* Member Progress Modal */}
      <MemberProgressModal
        visible={isProgressModalVisible}
        member={selectedMember}
        boardId={boardId}
        boardName={boardName || `Board #${boardId}`}
        onClose={() => {
          setIsProgressModalVisible(false);
          setSelectedMember(null);
        }}
      />
    </div>
  );
};

export default TeamMembersTab;
