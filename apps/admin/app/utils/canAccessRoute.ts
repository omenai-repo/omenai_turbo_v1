import { TeamMember } from "@omenai/shared-types";

export type KeyList =
  | "requests"
  | "taxes"
  | "editorials"
  | "promotionals"
  | "team"
  | "settings"
  | "logout"
  | "analytics"
  | "support";
const routePermissionsMap = new Map<string, TeamMember["access_role"][]>([
  ["requests", ["Owner", "Admin"]],
  ["taxes", ["Owner"]],
  ["editorials", ["Owner", "Admin", "Editor"]],
  ["promotionals", ["Owner", "Admin", "Editor"]],
  ["team", ["Owner", "Admin", "Editor", "Viewer"]],
  ["settings", ["Owner", "Admin", "Editor", "Viewer"]],
  ["logout", ["Owner", "Admin", "Editor", "Viewer"]],
  ["analytics", ["Owner", "Admin"]],
  ["support", ["Owner", "Admin", "Editor"]],
]);

export function canAccessRoute(
  userRole: TeamMember["access_role"],
  routePath: KeyList,
): boolean {
  const allowedRoles = routePermissionsMap.get(routePath);
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}
