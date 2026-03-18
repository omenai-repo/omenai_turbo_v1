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
  | "support"
  | "artworks"
  | "shipments"
  | "reviews";
const routePermissionsMap = new Map<string, TeamMember["access_role"][]>([
  ["requests", ["Owner", "Admin", "Principal"]],
  ["taxes", ["Owner"]],
  ["editorials", ["Owner", "Admin", "Editor", "Principal"]],
  ["promotionals", ["Owner", "Admin", "Editor", "Principal"]],
  ["team", ["Owner", "Admin"]],
  ["settings", ["Owner", "Admin", "Editor", "Principal"]],
  ["logout", ["Owner", "Admin", "Editor", "Principal"]],
  ["analytics", ["Owner", "Admin"]],
  ["support", ["Owner", "Admin", "Principal"]],
  ["artworks", ["Owner", "Admin", "Principal"]],
  ["shipments", ["Owner", "Admin"]],
  ["reviews", ["Owner", "Admin"]],
]);

export function canAccessRoute(
  userRole: TeamMember["access_role"],
  routePath: KeyList,
): boolean {
  const allowedRoles = routePermissionsMap.get(routePath);
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}
