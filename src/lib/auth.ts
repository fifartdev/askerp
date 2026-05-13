import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from './payload'

export type UserRole = 'superadmin' | 'admin' | 'client'

export interface AuthUser {
  id: string | number
  email: string
  name?: string
  role: UserRole
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const headers = await getHeaders()
  const payload = await getPayload()
  const { user } = await payload.auth({ headers })
  if (!user) return null
  return user as unknown as AuthUser
}

export async function requireAuth(redirectTo = '/login'): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) redirect(redirectTo)
  return user
}

export async function requireAdminOrSuperAdmin(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    redirect('/login')
  }
  return user
}

export async function requireSuperAdmin(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user || user.role !== 'superadmin') redirect('/login')
  return user
}
