import type { AccessArgs } from 'payload'

export const isSuperAdmin = ({ req: { user } }: AccessArgs): boolean =>
  (user as any)?.role === 'superadmin'
