import Link from 'next/link'
import { Suspense } from 'react'
import { getPayload } from '@/lib/payload'
import { SearchInput } from '@/components/admin/SearchInput'

export const dynamic = 'force-dynamic'

async function ClientsTable({ q }: { q: string }) {
  const payload = await getPayload()

  const where: Record<string, any> = {}
  if (q) {
    where.or = [
      { name: { contains: q } },
      { mobile: { contains: q } },
      { landline: { contains: q } },
    ]
  }

  const { docs: clients, totalDocs } = await payload.find({
    collection: 'clients',
    where,
    overrideAccess: true,
    limit: 100,
    sort: 'name',
  })

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-sm">
          {q ? `Δεν βρέθηκαν πελάτες για "${q}".` : 'Δεν υπάρχουν πελάτες ακόμα.'}
        </p>
        {!q && (
          <Link
            href="/dashboard/clients/new"
            className="mt-4 inline-block text-brand-600 text-sm font-medium hover:underline"
          >
            Προσθέστε τον πρώτο πελάτη
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-gray-500 -mt-2">
        {totalDocs} {totalDocs === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'}
        {q && <span> για &ldquo;{q}&rdquo;</span>}
      </p>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ονοματεπώνυμο</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Κινητό</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Σταθερό</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">1η Διεύθυνση</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                  {client.mobile || '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                  {client.landline || '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell max-w-xs truncate">
                  {(client.addresses as any[])?.[0]?.address || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Προβολή
                    </Link>
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      Επεξεργασία
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Πελάτες</h2>
        <Link
          href="/dashboard/clients/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Νέος Πελάτης
        </Link>
      </div>

      <Suspense>
        <SearchInput placeholder="Αναζήτηση ονόματος, τηλεφώνου..." />
      </Suspense>

      <Suspense fallback={<div className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" />}>
        <ClientsTable q={q} />
      </Suspense>
    </div>
  )
}
