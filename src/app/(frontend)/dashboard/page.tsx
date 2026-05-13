import Link from 'next/link'
import { getPayload } from '@/lib/payload'
import { StatCard } from '@/components/admin/StatCard'

export const dynamic = 'force-dynamic'

async function getStats() {
  const payload = await getPayload()

  const [clients, allOrders] = await Promise.all([
    payload.count({ collection: 'clients', overrideAccess: true }),
    payload.find({
      collection: 'service-orders',
      overrideAccess: true,
      pagination: false,
      select: { status: true, price: true },
    }),
  ])

  const orders = allOrders.docs
  const open = orders.filter((o) => o.status === 'open').length
  const inProgress = orders.filter((o) => o.status === 'in_progress').length
  const completed = orders.filter((o) => o.status === 'completed').length

  const revenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.price ?? 0), 0)

  return {
    totalClients: clients.totalDocs,
    openOrders: open,
    inProgressOrders: inProgress,
    completedOrders: completed,
    totalRevenue: revenue,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Αρχική</h2>
        <p className="text-sm text-gray-500 mt-1">Επισκόπηση δεδομένων</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Σύνολο Πελατών" value={stats.totalClients} />
        <StatCard label="Ανοιχτές Εντολές" value={stats.openOrders} colorClass="bg-blue-50" />
        <StatCard label="Σε Εξέλιξη" value={stats.inProgressOrders} colorClass="bg-yellow-50" />
        <StatCard label="Ολοκληρωμένες" value={stats.completedOrders} colorClass="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Συνολικά Έσοδα (Ολοκληρωμένες)</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {stats.totalRevenue.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/orders/new"
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-xl text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Νέα Εντολή
        </Link>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-3 px-4 rounded-xl text-sm transition-colors"
        >
          Νέος Πελάτης
        </Link>
        <Link
          href="/dashboard/orders"
          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium py-3 px-4 rounded-xl text-sm transition-colors"
        >
          Όλες οι Εντολές
        </Link>
      </div>
    </div>
  )
}
