export async function hasAdminPanelAccess(roles: string[]): Promise<boolean> {
  if (!roles) return
  return (
    roles.includes('owner') ||
    roles.includes('manage-general') ||
    roles.includes('manage-settings')
  )
}

export async function hasModeratorPanelAccess(
  roles: string[]
): Promise<boolean> {
  return roles.includes('moderation')
}
