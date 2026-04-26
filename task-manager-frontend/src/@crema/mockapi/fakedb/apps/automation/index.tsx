export type AutomationRuleType = {
  id: number;
  name: string;
  description: string;
  trigger: string;
  action: string;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
};

const automationRules: AutomationRuleType[] = [
  {
    id: 1,
    name: "Auto-assign to team lead",
    description: "Automatically assign high priority tasks to team lead",
    trigger: 'When card is labeled "High Priority"',
    action: "Assign to Johnson",
    enabled: true,
    createdBy: "Admin",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Move completed tasks",
    description: "Move tasks to Done when all checklist items are completed",
    trigger: "When all checklist items are checked",
    action: 'Move card to "Done" list',
    enabled: true,
    createdBy: "Admin",
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    name: "Notify on deadline",
    description: "Send notification 1 day before deadline",
    trigger: "When deadline is in 24 hours",
    action: "Send notification to assigned members",
    enabled: false,
    createdBy: "Admin",
    createdAt: "2024-01-05",
  },
  {
    id: 4,
    name: "Archive old cards",
    description: "Archive cards that have been in Done for 30 days",
    trigger: 'When card is in "Done" for 30 days',
    action: "Archive card",
    enabled: true,
    createdBy: "Admin",
    createdAt: "2024-01-01",
  },
];

export default automationRules;
