import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Ανοιχτή', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'Σε Εξέλιξη', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Ολοκληρώθηκε', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Ακυρώθηκε', color: 'bg-red-100 text-red-700' },
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload()

  const order = await payload
    .findByID({ collection: 'service-orders', id, overrideAccess: true, depth: 1 })
    .catch(() => null)

  if (!order) notFound()

  const s = STATUS_LABELS[order.status ?? 'open']
  const client = typeof order.client === 'object' ? (order.client as any) : null
  const category = typeof order.category === 'object' ? (order.category as any) : null
  const history = (order.statusHistory as any[]) ?? []
  const serviceAddress = (order.serviceAddress as any) ?? null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 font-mono">{order.orderNumber}</h2>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
          {s.label}
        </span>
        <Link
          href={`/dashboard/orders/${id}/edit`}
          className="ml-auto text-sm text-brand-600 font-medium hover:underline"
        >
          Επεξεργασία
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Στοιχεία Εντολής</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-400">Πελάτης</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {client ? (
                    <Link href={`/dashboard/clients/${client.id}`} className="text-brand-600 hover:underline">
                      {client.name}
                    </Link>
                  ) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Κατηγορία</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{category?.name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Ημερομηνία</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {order.date ? new Date(order.date).toLocaleDateString('el-GR') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Τιμή</dt>
                <dd className="mt-1 text-sm font-bold text-gray-900">
                  {order.price != null
                    ? Number(order.price).toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })
                    : '—'}
                </dd>
              </div>
              {serviceAddress?.address && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Διεύθυνση Εργασίας</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {serviceAddress.addressType && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mr-2">
                        {serviceAddress.addressType}
                      </span>
                    )}
                    {serviceAddress.address}
                  </dd>
                </div>
              )}
              {order.description && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-400">Περιγραφή</dt>
                  <dd className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{order.description}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Status history timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ιστορικό Καταστάσεων</h3>
          {history.length === 0 ? (
            <p className="text-xs text-gray-400">Δεν υπάρχει ιστορικό.</p>
          ) : (
            <ol className="relative border-l border-gray-200 space-y-4 ml-3">
              {history.map((entry: any, i: number) => {
                const es = STATUS_LABELS[entry.status] ?? { label: entry.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-300" />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${es.color}`}>
                      {es.label}
                    </span>
                    {entry.changedAt && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(entry.changedAt).toLocaleString('el-GR')}
                      </p>
                    )}
                    {entry.note && (
                      <p className="mt-1 text-xs text-gray-600">{entry.note}</p>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
