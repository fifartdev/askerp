import type { AccessArgs } from 'payload'

export const isClient = ({ req: { user } }: AccessArgs): boolean =>
  (user as any)?.role === 'client'
