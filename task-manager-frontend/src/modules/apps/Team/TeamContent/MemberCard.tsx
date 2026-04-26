import React, { useState } from "react";
import { Avatar, Tag, Button, Dropdown, message, Modal } from "antd";
import {
  MailOutlined,
  MoreOutlined,
  DeleteOutlined,
  UserOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  StyledMemberCard,
  StyledMemberInfo,
  StyledMemberStats,
} from "./index.styled";
import { TeamMember, TeamRole } from "@crema/services/PermissionService";
import {
  getRoleColor,
  getRoleIcon,
  getRoleDisplayName,
} from "@crema/helpers/roleUtils";
import { boardMemberService } from "@crema/services/BoardMemberService";
import IntlMessages from "@crema/helpers/IntlMessages";
import { useIntl } from "react-intl";

type MemberCardProps = {
  member: TeamMember;
  currentUserRole: TeamRole;
  onMemberUpdate: () => void;
  boardId?: number; // Optional board ID for board-specific actions
};

const MemberCard: React.FC<MemberCardProps> = ({
  member,
  currentUserRole,
  onMemberUpdate,
  boardId,
}) => {
  const [loading, setLoading] = useState(false);
  const { messages } = useIntl();

  const handleRemoveMember = async () => {
    const isBoardContext = boardId !== undefined;
    const title = isBoardContext 
      ? messages["team.removeFromBoard"] as string
      : messages["team.removeFromTeam"] as string;
    const content = isBoardContext
      ? `${messages["team.confirmRemoveFromBoard"]} ${member.name}?`
      : `${messages["team.confirmRemoveFromTeam"]} ${member.name}?`;

    Modal.confirm({
      title,
      content,
      onOk: async () => {
        try {
          if (isBoardContext) {
            await boardMemberService.removeBoardMember(boardId!, member.id);
            message.success(messages["team.memberRemovedSuccess"] as string);
          } else {
            message.error(messages["team.removeTeamNotImplemented"] as string);
            return;
          }
          onMemberUpdate();
        } catch (error) {
          message.error(messages["team.failedToRemoveMember"] as string);
        }
      },
    });
  };

  const handleChangeRole = async (newRole: 'PM' | 'TEAM_LEAD' | 'MEMBER') => {
    if (!boardId) {
      message.error(messages["team.noBoardSelected"] as string);
      return;
    }

    Modal.confirm({
      title: messages["team.changeRole"] as string,
      content: `${messages["team.confirmChangeRole"]} ${member.name} ${messages["team.to"]} ${getRoleDisplayName(newRole as any)}?`,
      onOk: async () => {
        setLoading(true);
        try {
          await boardMemberService.updateMemberRole(boardId, member.id, newRole);
          message.success(messages["team.roleChangedSuccess"] as string);
          onMemberUpdate();
        } catch (error) {
          message.error(messages["team.failedToChangeRole"] as string);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getMenuItems = () => {
    const items = [];

    // Chuẩn hóa role từ backend về format TeamRole để so sánh logic
    let normalizedMemberRole = member.role as string;
    if (member.role === 'Project Manager') normalizedMemberRole = 'PM';
    else if (member.role === 'Team Lead') normalizedMemberRole = 'TEAM_LEAD';
    else if (member.role === 'Member') normalizedMemberRole = 'MEMBER';

    // Change role menu - only PM can change roles, and cannot change own role
    if (boardId && currentUserRole === TeamRole.PM && normalizedMemberRole !== currentUserRole) {
      const roleItems = [];
      
      if (normalizedMemberRole !== 'PM') {
        roleItems.push({
          key: "role-pm",
          label: `${getRoleIcon('PM')} ${messages["team.rolePM"]}`,
          onClick: () => handleChangeRole('PM'),
        });
      }
      
      if (normalizedMemberRole !== 'TEAM_LEAD') {
        roleItems.push({
          key: "role-team-lead",
          label: `${getRoleIcon('TEAM_LEAD')} ${messages["team.roleTeamLead"]}`,
          onClick: () => handleChangeRole('TEAM_LEAD'),
        });
      }
      
      if (normalizedMemberRole !== 'MEMBER') {
        roleItems.push({
          key: "role-member",
          label: `${getRoleIcon('MEMBER')} ${messages["team.roleMember"]}`,
          onClick: () => handleChangeRole('MEMBER'),
        });
      }

      if (roleItems.length > 0) {
        items.push({
          key: "change-role",
          label: messages["team.changeRole"] as string,
          icon: <SwapOutlined />,
          children: roleItems,
        });
      }
    }

    // Delete member - PM can delete anyone except themselves, TEAM_LEAD can delete MEMBER
    if (
      boardId &&
      ((currentUserRole === TeamRole.PM && normalizedMemberRole !== currentUserRole) ||
      (currentUserRole === TeamRole.TEAM_LEAD && normalizedMemberRole === TeamRole.MEMBER))
    ) {
      const removeLabel = messages["team.removeFromBoard"] as string;
      items.push({
        key: "delete",
        label: removeLabel,
        icon: <DeleteOutlined />,
        danger: true,
        onClick: handleRemoveMember,
      });
    }

    return items;
  };

  return (
    <>
      <StyledMemberCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Avatar src={member.avatar} size={64} icon={<UserOutlined />} />
          {getMenuItems().length > 0 && (
            <Dropdown
              menu={{ items: getMenuItems() }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </div>

        <StyledMemberInfo>
          <h3>{member.name}</h3>
          <p>
            <MailOutlined /> {member.email}
          </p>
          <Tag color={getRoleColor(member.role)}>
            {getRoleIcon(member.role)} {getRoleDisplayName(member.role)}
          </Tag>
        </StyledMemberInfo>

        <StyledMemberStats>
          <div>
            <strong>{member.boards || 0}</strong>
            <span><IntlMessages id="team.boards" /></span>
          </div>
          <div>
            <strong>{member.tasks || 0}</strong>
            <span><IntlMessages id="team.tasks" /></span>
          </div>
        </StyledMemberStats>
      </StyledMemberCard>
    </>
  );
};

export default MemberCard;
