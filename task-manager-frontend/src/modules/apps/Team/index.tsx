import { useState, useEffect } from "react";
import { Tabs } from "antd";
import AppsContainer from "@crema/components/AppsContainer";
import TeamSidebar from "./TeamSidebar";
import RolesPermissionsTab from "./RolesPermissionsTab";
import TeamMembersTab from "./TeamMembersTab";
import IntlMessages from "@crema/helpers/IntlMessages";

const Team = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [selectedBoardId, setSelectedBoardId] = useState<number | undefined>(
    undefined
  );
  const [selectedBoardName, setSelectedBoardName] = useState<
    string | undefined
  >(undefined);

  // Load default board (first board) on mount
  useEffect(() => {
    // This will be handled by TeamSidebar
  }, []);

  const handleBoardSelect = (boardId: number, boardName: string) => {
    setSelectedBoardId(boardId);
    setSelectedBoardName(boardName);
  };

  const tabItems = [
    {
      key: "roles",
      label: "Roles & Permissions",
      children: <RolesPermissionsTab />,
    },
    {
      key: "members",
      label: "Team Members",
      children: (
        <TeamMembersTab
          boardId={selectedBoardId}
          boardName={selectedBoardName}
        />
      ),
    },
  ];

  return (
    <AppsContainer
      title="Team Management"
      sidebarContent={
        <TeamSidebar
          selectedBoardId={selectedBoardId}
          onBoardSelect={handleBoardSelect}
        />
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ height: "100%" }}
        tabBarStyle={{ marginBottom: 0, padding: "0 24px" }}
      />
    </AppsContainer>
  );
};

export default Team;
