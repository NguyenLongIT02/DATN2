import { useState } from "react";
import { List, Switch, Tag } from "antd";
import AppCard from "@crema/components/AppCard";
import AppScrollbar from "@crema/components/AppScrollbar";
import IntlMessages from "@crema/helpers/IntlMessages";
import AutomationRuleItem from "./AutomationRuleItem";

type AutomationRule = {
  id: number;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
};

const AutomationContent = () => {
  // Only keep the logical "Notify on deadline" rule
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 1,
      name: "automation.rule.notifyOnDeadline.name",
      description: "automation.rule.notifyOnDeadline.description",
      trigger: "automation.rule.notifyOnDeadline.trigger",
      action: "automation.rule.notifyOnDeadline.action",
      enabled: false,
      createdBy: "Admin",
      createdAt: "2024-01-05",
    },
  ]);

  const handleToggle = (id: number, enabled: boolean) => {
    setRules(
      rules.map((rule) => (rule.id === id ? { ...rule, enabled } : rule))
    );
  };

  return (
    <AppScrollbar style={{ height: "100%" }}>
      <div style={{ padding: "20px" }}>
        <AppCard title={<IntlMessages id="automation.rules" />}>
          <List
            dataSource={rules}
            renderItem={(rule) => (
              <AutomationRuleItem rule={rule} onToggle={handleToggle} />
            )}
          />
        </AppCard>
      </div>
    </AppScrollbar>
  );
};

export default AutomationContent;
