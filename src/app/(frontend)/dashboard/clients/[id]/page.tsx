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

const ADDRESS_TYPE_LABELS: Record<string, string> = {
  home: 'Κατοικία',
  work: 'Εργασία',
  office: 'Γραφείο',
  warehouse: 'Αποθήκη',
  other: 'Άλλο',
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload()

  const client = await payload
    .findByID({ collection: 'clients', id, overrideAccess: true })
    .catch(() => null)

  if (!client) notFound()

  const { docs: orders } = await payload.find({
    collection: 'service-orders',
    where: { client: { equals: id } },
    overrideAccess: true,
    sort: '-date',
    limit: 50,
    depth: 1,
  })

  const addresses = (client.addresses as any[]) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clients" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
        <Link
          href={`/dashboard/clients/${id}/edit`}
          className="ml-auto text-sm text-brand-600 font-medium hover:underline"
        >
          Επεξεργασία
        </Link>
      </div>

      {/* Client info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Στοιχεία Πελάτη</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.mobile && (
            <div>
              <dt className="text-xs text-gray-400">Κινητό</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{client.mobile}</dd>
            </div>
          )}
          {client.landline && (
            <div>
              <dt className="text-xs text-gray-400">Σταθερό</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">{client.landline}</dd>
            </div>
          )}
          {client.notes && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-400">Σημειώσεις</dt>
              <dd className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Addresses */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Διευθύνσεις ({addresses.length})
        </h3>
        {addresses.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-400">Δεν έχουν καταχωρηθεί διευθύνσεις.</p>
            <Link
              href={`/dashboard/clients/${id}/edit`}
              className="mt-2 inline-block text-brand-600 text-sm font-medium hover:underline"
            >
              Προσθήκη διεύθυνσης
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {addresses.map((addr: any, i: number) => (
              <div key={addr.id ?? i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-1">
                    {ADDRESS_TYPE_LABELS[addr.type] ?? addr.type}
                  </span>
                  <p className="text-sm text-gray-800 leading-snug">
                    {addr.address || <span className="text-gray-400 italic">Χωρίς διεύθυνση</span>}
                  </p>
                  {addr.lat && addr.lng && (
                    <p className="mt-0.5 text-xs text-gray-400">
                      {Number(addr.lat).toFixed(5)}, {Number(addr.lng).toFixed(5)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Εντολές Εργασίας ({orders.length})
          </h3>
          <Link
            href={`/dashboard/orders/new?client=${id}`}
            className="text-xs text-brand-600 font-medium hover:underline"
          >
            + Νέα Εντολή
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">Δεν υπάρχουν εντολές για αυτόν τον πελάτη.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Αριθμός</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Κατηγορία</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Κατάσταση</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Ημερομηνία</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Τιμή</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const s = STATUS_LABELS[order.status ?? 'open']
                  const cat = typeof order.category === 'object' ? (order.category as any)?.name : '—'
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{cat}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {order.date ? new Date(order.date).toLocaleDateString('el-GR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {order.price != null ? `${Number(order.price).toFixed(2)} €` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          Προβολή
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
