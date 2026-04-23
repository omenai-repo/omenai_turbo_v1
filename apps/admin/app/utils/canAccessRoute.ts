import { TeamMember } from "@omenai/shared-types";

export type KeyList =
  | "owner_access"
  | "management_access"
  | "admin_access"
  | "mid_level_access"
  | "low_level_access";

const routePermissionsMap = new Map<KeyList, TeamMember["access_role"][]>([
  ["owner_access", ["Owner"]],
  ["admin_access", ["Owner", "Admin"]],
  ["management_access", ["Owner", "Admin", "Principal"]],
  ["mid_level_access", ["Owner", "Admin", "Principal", "Editor"]],
  ["low_level_access", ["Owner", "Admin", "Principal", "Editor", "Viewer"]],
]);

export function canAccessRoute(
  userRole: TeamMember["access_role"],
  routePath: KeyList,
): boolean {
  const allowedRoles = routePermissionsMap.get(routePath);
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}
