import Link from 'next/link'
import { Suspense } from 'react'
import { getPayload } from '@/lib/payload'
import { SearchInput } from '@/components/admin/SearchInput'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Ανοιχτή', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Σε Εξέλιξη', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Ολοκληρώθηκε', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Ακυρώθηκε', color: 'bg-red-100 text-red-700' },
}

async function OrdersTable({ status, q }: { status: string; q: string }) {
  const payload = await getPayload()

  const where: Record<string, any> = {}
  if (status && status !== 'all') {
    where.status = { equals: status }
  }
  if (q) {
    const qConditions = [
      { orderNumber: { contains: q } },
      { description: { contains: q } },
    ]
    where.or = where.status
      ? [{ and: [{ status: { equals: status } }, { or: qConditions }] }]
      : qConditions
  }

  const { docs: orders, totalDocs } = await payload.find({
    collection: 'service-orders',
    where,
    overrideAccess: true,
    sort: '-date',
    limit: 200,
    depth: 1,
  })

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">Δεν βρέθηκαν εντολές.</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-gray-500 -mt-1">
        {totalDocs} {totalDocs === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'}
        {q && <span> για &ldquo;{q}&rdquo;</span>}
      </p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Αριθμός</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Πελάτης</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Κατηγορία</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Ημερομηνία</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Τιμή</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => {
              const s = STATUS_LABELS[order.status ?? 'open']
              const client = typeof order.client === 'object' ? (order.client as any)?.name : '—'
              const cat = typeof order.category === 'object' ? (order.category as any)?.name : '—'
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-700 hidden sm:table-cell">{client}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{cat}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                    {order.date ? new Date(order.date).toLocaleDateString('el-GR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {order.price != null ? `${Number(order.price).toFixed(2)} €` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-xs text-brand-600 hover:underline font-medium">
                        Προβολή
                      </Link>
                      <Link href={`/dashboard/orders/${order.id}/edit`} className="text-xs text-gray-400 hover:underline">
                        Επεξεργασία
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status = 'all', q = '' } = await searchParams

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Εντολές Εργασίας</h2>
        <Link
          href="/dashboard/orders/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Νέα Εντολή
        </Link>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Suspense>
          <SearchInput placeholder="Αναζήτηση αριθμού, περιγραφής..." />
        </Suspense>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'Όλες' },
            { value: 'open', label: 'Ανοιχτές' },
            { value: 'in_progress', label: 'Σε Εξέλιξη' },
            { value: 'completed', label: 'Ολοκληρωμένες' },
            { value: 'cancelled', label: 'Ακυρωμένες' },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={`/dashboard/orders?status=${tab.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                status === tab.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" />}>
        <OrdersTable status={status} q={q} />
      </Suspense>
    </div>
  )
}
