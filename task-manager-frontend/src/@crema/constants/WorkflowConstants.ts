// Workflow status types - must match backend ListStatusType enum
export enum WorkflowStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  NONE = "NONE",
}

// Workflow validation rules
export const WORKFLOW_RULES = {
  // Forbidden transitions
  FORBIDDEN_TRANSITIONS: [
    { from: WorkflowStatus.TODO, to: WorkflowStatus.DONE },
  ],

  // Transitions that require dependency check
  REQUIRES_DEPENDENCY_CHECK: [WorkflowStatus.IN_PROGRESS],

  // Transitions that require DoD check
  REQUIRES_DOD_CHECK: [WorkflowStatus.DONE],
};

// Helper functions
export const isTransitionForbidden = (
  fromStatus: string | undefined,
  toStatus: string | undefined
): boolean => {
  if (!fromStatus || !toStatus) return false;
  return WORKFLOW_RULES.FORBIDDEN_TRANSITIONS.some(
    (rule) => rule.from === fromStatus && rule.to === toStatus
  );
};

export const requiresDependencyCheck = (
  toStatus: string | undefined
): boolean => {
  if (!toStatus) return false;
  return WORKFLOW_RULES.REQUIRES_DEPENDENCY_CHECK.includes(
    toStatus as WorkflowStatus
  );
};

export const requiresDoDCheck = (toStatus: string | undefined): boolean => {
  if (!toStatus) return false;
  return WORKFLOW_RULES.REQUIRES_DOD_CHECK.includes(toStatus as WorkflowStatus);
};

// Check if card is blocked by dependencies
export const isCardBlocked = (
  card: { dependencies?: number[]; status?: string },
  allCards: { id: number; status?: string }[]
): boolean => {
  // If dependencies not loaded yet, don't block (let backend decide)
  if (!card.dependencies) return false;
  if (card.dependencies.length === 0) return false;

  // Check if any dependency is not DONE
  return card.dependencies.some((depId) => {
    const depCard = allCards.find((c) => c.id === depId);
    
    // If dependency card not found, consider as blocking (safe default)
    if (!depCard) {
      console.warn(`Dependency card ${depId} not found in current board`);
      return true;
    }
    
    return depCard.status !== WorkflowStatus.DONE;
  });
};

// Get workflow status display name
export const getWorkflowStatusDisplay = (status: string | undefined): string => {
  switch (status) {
    case WorkflowStatus.TODO:
      return "To Do";
    case WorkflowStatus.IN_PROGRESS:
      return "In Progress";
    case WorkflowStatus.DONE:
      return "Done";
    case WorkflowStatus.NONE:
      return "None";
    default:
      return "Unknown";
  }
};

// Get workflow status color
export const getWorkflowStatusColor = (status: string | undefined): string => {
  switch (status) {
    case WorkflowStatus.TODO:
      return "#1890ff"; // Blue
    case WorkflowStatus.IN_PROGRESS:
      return "#faad14"; // Orange
    case WorkflowStatus.DONE:
      return "#52c41a"; // Green
    case WorkflowStatus.NONE:
      return "#d9d9d9"; // Gray
    default:
      return "#d9d9d9";
  }
};
