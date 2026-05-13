import type { AccessArgs } from 'payload'

export const isAdminOrSuperAdmin = ({ req: { user } }: AccessArgs): boolean => {
  const role = (user as any)?.role
  return role === 'admin' || role === 'superadmin'
}
