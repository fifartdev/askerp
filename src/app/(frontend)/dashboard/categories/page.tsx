import Link from 'next/link'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const payload = await getPayload()
  const { docs: categories } = await payload.find({
    collection: 'service-categories',
    overrideAccess: true,
    sort: 'name',
    limit: 200,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Κατηγορίες Υπηρεσιών</h2>
          <p className="text-sm text-gray-500 mt-1">{categories.length} σύνολο</p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Νέα Κατηγορία
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">Δεν υπάρχουν κατηγορίες ακόμα.</p>
          <Link
            href="/dashboard/categories/new"
            className="mt-4 inline-block text-brand-600 text-sm font-medium hover:underline"
          >
            Προσθέστε την πρώτη κατηγορία
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Όνομα</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/categories/${cat.id}/edit`}
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Επεξεργασία
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
