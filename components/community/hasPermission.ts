export function hasAdminPanelAccess(roles: string[]): boolean {
  return (
    roles.includes("owner") ||
    roles.includes("manage-general") ||
    roles.includes("manage-settings")
  )
}

export function hasModeratorPanelAccess(roles: string[]): boolean {
  return roles.includes("moderation")
}
