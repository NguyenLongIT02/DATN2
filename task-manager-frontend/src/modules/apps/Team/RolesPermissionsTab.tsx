import React from "react";
import { Row, Col, Card, Tag, Typography, Space } from "antd";
import { TeamRole } from "@crema/services/PermissionService";
import {
  getRoleColor,
  getRoleIcon,
  getRoleDisplayName,
} from "@crema/helpers/roleUtils";
import { permissionService } from "@crema/services/PermissionService";
import IntlMessages from "@crema/helpers/IntlMessages";
import AppScrollbar from "@crema/components/AppScrollbar";
import { useIntl } from "react-intl";

const { Title, Text, Paragraph } = Typography;

const RolesPermissionsTab: React.FC = () => {
  const { messages } = useIntl();
  const roles = ["PM", "TEAM_LEAD", "MEMBER"];

  const getRoleDescription = (role: string): string => {
    switch (role) {
      case "PM":
        return messages["team.pmGuide"] as string;
      case "TEAM_LEAD":
        return messages["team.teamLeadGuide"] as string;
      case "MEMBER":
        return messages["team.memberGuide"] as string;
      default:
        return "";
    }
  };

  const getPermissionList = (role: string) => {
    // TEAM_LEAD has similar permissions to PM except delete board
    const isPM = role === "PM";
    const isTeamLead = role === "TEAM_LEAD";
    const isMember = role === "MEMBER";

    const permissionList = [];

    if (isPM || isTeamLead) {
      permissionList.push(messages["team.permissionEditBoard"] as string);
      permissionList.push(messages["team.permissionManageMembers"] as string);
      permissionList.push(messages["team.permissionInviteMembers"] as string);
      permissionList.push(messages["team.permissionEditCards"] as string);
      permissionList.push(messages["team.permissionDeleteCards"] as string);
      permissionList.push(messages["team.permissionMoveCards"] as string);
    }

    if (isPM) {
      permissionList.push(messages["team.permissionDeleteBoard"] as string);
      permissionList.push(messages["team.permissionChangeRoles"] as string);
    }

    if (isMember) {
      permissionList.push(messages["team.permissionViewBoard"] as string);
      permissionList.push(messages["team.permissionCommentCards"] as string);
      permissionList.push(messages["team.permissionUpdateChecklist"] as string);
    }

    return permissionList;
  };

  return (
    <AppScrollbar style={{ height: "calc(100vh - 300px)" }}>
      <div style={{ padding: "32px 24px" }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <Title level={2} style={{ marginBottom: 16, color: "#1f2937" }}>
            <IntlMessages id="team.rolesPermissions" />
          </Title>
          <Paragraph
            style={{
              fontSize: 16,
              color: "#6b7280",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            <IntlMessages id="team.rolesPermissionsDescription" />
          </Paragraph>
        </div>

        <Row gutter={[40, 40]} justify="center">
          {roles.map((role) => {
            const permissions = getPermissionList(role);
            const roleColor = role === "PM" ? "#ef4444" : role === "TEAM_LEAD" ? "#a855f7" : "#10b981";

            return (
              <Col key={role} xs={24} sm={24} md={12} lg={8}>
                <Card
                  style={{
                    height: "100%",
                    border: `2px solid ${roleColor}`,
                    borderRadius: 20,
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "white",
                    overflow: "hidden",
                  }}
                  bodyStyle={{ padding: 0 }}
                  hoverable
                >
                  {/* Header with gradient */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${
                        role === "PM"
                          ? "#fef2f2 0%, #fee2e2 100%"
                          : role === "TEAM_LEAD"
                          ? "#faf5ff 0%, #f3e8ff 100%"
                          : "#f0fdf4 0%, #dcfce7 100%"
                      }`,
                      padding: "32px 32px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 56,
                        marginBottom: 20,
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
                      }}
                    >
                      {getRoleIcon(role)}
                    </div>
                    <Tag
                      color={getRoleColor(role)}
                      style={{
                        fontSize: 16,
                        padding: "8px 20px",
                        marginBottom: 16,
                        borderRadius: 16,
                        fontWeight: 600,
                        border: "none",
                      }}
                    >
                      {getRoleDisplayName(role)}
                    </Tag>
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "#64748b",
                        display: "block",
                        marginTop: 8,
                      }}
                    >
                      {getRoleDescription(role)}
                    </Text>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "24px 32px 32px" }}>
                    <Title
                      level={5}
                      style={{
                        marginBottom: 20,
                        textAlign: "center",
                        color: "#374151",
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      <IntlMessages id="team.permissions" />
                    </Title>
                    <Space
                      direction="vertical"
                      size={12}
                      style={{ width: "100%" }}
                    >
                      {permissions.map((permission, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 16px",
                            backgroundColor: "#f8fafc",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 500,
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span
                            style={{
                              color: "#10b981",
                              marginRight: 10,
                              fontSize: 14,
                              fontWeight: "bold",
                            }}
                          >
                            ✓
                          </span>
                          {permission}
                        </div>
                      ))}
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        <div
          style={{
            marginTop: 64,
            padding: "40px 32px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 24,
            color: "white",
            boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
          }}
        >
          <Title
            level={3}
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: 40,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            📖 <IntlMessages id="team.usageGuide" />
          </Title>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} md={8}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "28px 24px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 16, fontSize: 20 }}
                >
                  👑 <IntlMessages id="team.rolePM" />
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <IntlMessages id="team.pmGuide" />
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "28px 24px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 16, fontSize: 20 }}
                >
                  📋 <IntlMessages id="team.roleTeamLead" />
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <IntlMessages id="team.teamLeadGuide" />
                </Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  padding: "28px 24px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 16, fontSize: 20 }}
                >
                  👤 <IntlMessages id="team.roleMember" />
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <IntlMessages id="team.memberGuide" />
                </Text>
              </div>
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: 32 }}>
            <Col xs={24} md={18}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: "24px 28px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  textAlign: "center",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "white", marginBottom: 12, fontSize: 18 }}
                >
                  💡 <IntlMessages id="team.note" />
                </Title>
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  <IntlMessages id="team.leastPrivilege" />
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Security & Best Practices */}
        <div
          style={{
            marginTop: 48,
            padding: "40px 32px",
            backgroundColor: "#f8fafc",
            borderRadius: 20,
            border: "1px solid #e2e8f0",
          }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 36,
              color: "#1e293b",
              fontSize: 24,
            }}
          >
            🔒 <IntlMessages id="team.securityBestPractices" />
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "28px 24px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e2e8f0",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "#1e293b", marginBottom: 16, fontSize: 18 }}
                >
                  🛡️ <IntlMessages id="team.leastPrivilegeTitle" />
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: 15, lineHeight: 1.6, color: "#64748b" }}
                >
                  <IntlMessages id="team.leastPrivilegeDesc" />
                </Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "28px 24px",
                  borderRadius: 16,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e2e8f0",
                  height: "100%",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "#1e293b", marginBottom: 16, fontSize: 18 }}
                >
                  📊 <IntlMessages id="team.roleManagementTitle" />
                </Title>
                <Text
                  type="secondary"
                  style={{ fontSize: 15, lineHeight: 1.6, color: "#64748b" }}
                >
                  <IntlMessages id="team.roleManagementDesc" />
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        <div
          style={{
            marginTop: 48,
            padding: "40px 32px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(251, 191, 36, 0.2)",
          }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              marginBottom: 32,
              color: "#92400e",
              fontSize: 24,
            }}
          >
            💡 <IntlMessages id="team.quickTips" />
          </Title>
          <Row gutter={[32, 24]}>
            <Col xs={24} md={8}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "24px 20px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  height: "100%",
                }}
              >
                <Title
                  level={5}
                  style={{ color: "#92400e", marginBottom: 16, fontSize: 16 }}
                >
                  🎯 <IntlMessages id="team.forPMs" />
                </Title>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    <IntlMessages id="team.pmTip1" />
                  </li>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    <IntlMessages id="team.pmTip2" />
                  </li>
                  <li
                    style={{ fontSize: 14, lineHeight: 1.5, color: "#374151" }}
                  >
                    <IntlMessages id="team.pmTip3" />
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "24px 20px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  height: "100%",
                }}
              >
                <Title
                  level={5}
                  style={{ color: "#92400e", marginBottom: 16, fontSize: 16 }}
                >
                  📋 <IntlMessages id="team.forTeamLeads" />
                </Title>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    <IntlMessages id="team.teamLeadTip1" />
                  </li>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    <IntlMessages id="team.teamLeadTip2" />
                  </li>
                  <li
                    style={{ fontSize: 14, lineHeight: 1.5, color: "#374151" }}
                  >
                    <IntlMessages id="team.teamLeadTip3" />
                  </li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "24px 20px",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  height: "100%",
                }}
              >
                <Title
                  level={5}
                  style={{ color: "#92400e", marginBottom: 16, fontSize: 16 }}
                >
                  👥 <IntlMessages id="team.forMembers" />
                </Title>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    <IntlMessages id="team.memberTip1" />
                  </li>
                  <li
                    style={{
                      marginBottom: 10,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: "#374151",
                    }}
                  >
                    <IntlMessages id="team.memberTip2" />
                  </li>
                  <li
                    style={{ fontSize: 14, lineHeight: 1.5, color: "#374151" }}
                  >
                    <IntlMessages id="team.memberTip3" />
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </AppScrollbar>
  );
};

export default RolesPermissionsTab;
