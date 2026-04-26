import React, { ReactNode } from "react";
import { usePermissionGate } from "@crema/hooks/usePermissions";

interface PermissionGateProps {
  boardId: number;
  permission?: keyof ReturnType<typeof usePermissionGate>;
  action?: string;
  resourceType?:
    | "board"
    | "list"
    | "card"
    | "comment"
    | "attachment"
    | "member";
  fallback?: ReactNode;
  children: ReactNode;
  requireAll?: boolean;
  permissions?: (keyof ReturnType<typeof usePermissionGate>)[];
}

/**
 * PermissionGate component - Conditionally renders children based on permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  boardId,
  permission,
  action,
  resourceType,
  fallback = null,
  children,
  requireAll = false,
  permissions = [],
}) => {
  const gate = usePermissionGate(boardId);

  // Single permission check
  if (permission) {
    const hasPermission = gate[permission];
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Action-based permission check
  if (action && resourceType) {
    const gate = usePermissionGate(boardId);
    // Map action to permission
    const actionPermissionMap: Record<
      string,
      keyof ReturnType<typeof usePermissionGate>
    > = {
      create: "canCreateCards",
      read: "canView",
      update: "canEditCards",
      delete: "canDeleteCards",
      move: "canMoveCards",
      assign: "canInviteMembers",
      manage: "canManageBoard",
    };
    const permission = actionPermissionMap[action];
    const hasPermission = permission ? gate[permission] : false;
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions.length > 0) {
    const hasPermissions = requireAll
      ? permissions.every((p) => gate[p])
      : permissions.some((p) => gate[p]);

    return hasPermissions ? <>{children}</> : <>{fallback}</>;
  }

  // Default: render children
  return <>{children}</>;
};

// Convenience components for common permission checks
export const BoardManagementGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate
    boardId={boardId}
    permission="canManageBoard"
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const MemberManagementGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate
    boardId={boardId}
    permission="canManageMembers"
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CardEditGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate
    boardId={boardId}
    permission="canEditCards"
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const CommentGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate
    boardId={boardId}
    permission="canAddComments"
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

export const AnalyticsGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate
    boardId={boardId}
    permission="canViewAnalytics"
    fallback={fallback}
  >
    {children}
  </PermissionGate>
);

// Role-based gates
export const OwnerGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate boardId={boardId} permission="isOwner" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const AdminGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate boardId={boardId} permission="canManage" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const EditorGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate boardId={boardId} permission="canEdit" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const ViewerGate: React.FC<{
  boardId: number;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ boardId, children, fallback }) => (
  <PermissionGate boardId={boardId} permission="canView" fallback={fallback}>
    {children}
  </PermissionGate>
);
