import React from "react";
import { Tooltip } from "antd";
import {
  StyledScrumBoardMember,
  StyledScrumBoardMemberAvatar,
} from "./index.styled";
import { MemberObjType } from "@crema/types/models/apps/ScrumbBoard";

type MembersProps = {
  members: MemberObjType[];
};

const Members: React.FC<MembersProps> = ({ members }) => {
  // Ensure members is a valid array
  const safeMembers = Array.isArray(members) ? members : [];

  return (
    <StyledScrumBoardMember>
      {safeMembers.map((member) => {
        // Validate member object - silently skip invalid members
        if (!member || !member.id || !member.name) {
          return null;
        }

        return (
          <Tooltip title={member.name} key={member.id}>
            {member.avatar ? (
              <StyledScrumBoardMemberAvatar src={member.avatar} alt="created" />
            ) : (
              <StyledScrumBoardMemberAvatar>
                {member.name[0].toUpperCase()}
              </StyledScrumBoardMemberAvatar>
            )}
          </Tooltip>
        );
      })}
    </StyledScrumBoardMember>
  );
};

export default Members;
