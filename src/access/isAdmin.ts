import type { AccessArgs } from 'payload'

export const isAdmin = ({ req: { user } }: AccessArgs): boolean =>
  (user as any)?.role === 'admin'
