import { requireAdminOrSuperAdmin } from '@/lib/auth'
import { DashboardShell } from '@/components/admin/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminOrSuperAdmin()

  return <DashboardShell user={user}>{children}</DashboardShell>
}
