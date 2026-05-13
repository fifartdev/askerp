import Link from 'next/link'
import { getPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type MonthRow = { month: string; count: number; revenue: number }
type CategoryRow = { name: string; count: number; revenue: number }

async function getIncomeData(year: number) {
  const payload = await getPayload()

  const { docs: orders } = await payload.find({
    collection: 'service-orders',
    where: { status: { equals: 'completed' } },
    overrideAccess: true,
    pagination: false,
    depth: 1,
    select: { date: true, price: true, category: true },
  })

  // Filter by selected year
  const filtered = orders.filter((o) => {
    if (!o.date) return false
    return new Date(o.date).getFullYear() === year
  })

  const totalRevenue = filtered.reduce((s, o) => s + (o.price ?? 0), 0)
  const totalCount = filtered.length

  // Monthly breakdown
  const byMonth: Record<string, { count: number; revenue: number }> = {}
  for (let m = 1; m <= 12; m++) {
    byMonth[String(m).padStart(2, '0')] = { count: 0, revenue: 0 }
  }
  for (const o of filtered) {
    const m = String(new Date(o.date!).getMonth() + 1).padStart(2, '0')
    byMonth[m].count++
    byMonth[m].revenue += o.price ?? 0
  }
  const monthRows: MonthRow[] = Object.entries(byMonth).map(([m, v]) => ({
    month: new Date(`${year}-${m}-01`).toLocaleString('el-GR', { month: 'long', year: 'numeric' }),
    count: v.count,
    revenue: v.revenue,
  }))

  // Category breakdown
  const byCat: Record<string, { count: number; revenue: number }> = {}
  for (const o of filtered) {
    const catName =
      typeof o.category === 'object' && o.category
        ? (o.category as any).name ?? 'Χωρίς κατηγορία'
        : 'Χωρίς κατηγορία'
    if (!byCat[catName]) byCat[catName] = { count: 0, revenue: 0 }
    byCat[catName].count++
    byCat[catName].revenue += o.price ?? 0
  }
  const categoryRows: CategoryRow[] = Object.entries(byCat)
    .map(([name, v]) => ({ name, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)

  return { totalRevenue, totalCount, monthRows, categoryRows }
}

const GREEK_MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
  'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
  'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος',
]

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const currentYear = new Date().getFullYear()
  const { year: yearParam } = await searchParams
  const year = yearParam ? parseInt(yearParam) : currentYear

  const { totalRevenue, totalCount, monthRows, categoryRows } = await getIncomeData(year)

  const fmt = (n: number) =>
    n.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Έσοδα</h2>
          <p className="text-sm text-gray-500 mt-1">Από ολοκληρωμένες εντολές εργασίας</p>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {yearOptions.map((y) => (
            <Link
              key={y}
              href={`/dashboard/income?year=${y}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                y === year
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Συνολικά Έσοδα {year}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{fmt(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Ολοκληρωμένες Εντολές {year}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalCount}</p>
          {totalCount > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Μέση αξία: {fmt(totalRevenue / totalCount)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Ανά Μήνα</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 font-medium text-gray-500">Μήνας</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Εντολές</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-500">Έσοδα</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthRows.map((row) => (
                <tr
                  key={row.month}
                  className={`transition-colors ${row.count > 0 ? 'hover:bg-gray-50' : 'opacity-40'}`}
                >
                  <td className="px-4 py-2.5 text-gray-700 capitalize">{row.month}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{row.count || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                    {row.revenue > 0 ? fmt(row.revenue) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            {totalRevenue > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-200 bg-gray-50">
                  <td className="px-4 py-2.5 font-semibold text-gray-700">Σύνολο</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{totalCount}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-900">{fmt(totalRevenue)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Ανά Κατηγορία</h3>
          </div>
          {categoryRows.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">
              Δεν υπάρχουν ολοκληρωμένες εντολές για το {year}.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-500">Κατηγορία</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500">Εντολές</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500">Έσοδα</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-500 hidden sm:table-cell">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categoryRows.map((row) => (
                  <tr key={row.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 text-gray-700">{row.name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{row.count}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">{fmt(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400 hidden sm:table-cell">
                      {totalRevenue > 0
                        ? `${((row.revenue / totalRevenue) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {totalRevenue > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-700">Σύνολο</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{totalCount}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-gray-900">{fmt(totalRevenue)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-gray-700 hidden sm:table-cell">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Εμφανίζονται μόνο εντολές με κατάσταση &ldquo;Ολοκληρώθηκε&rdquo;.{' '}
        <Link href="/dashboard/orders?status=completed" className="text-brand-600 hover:underline">
          Προβολή εντολών
        </Link>
      </p>
    </div>
  )
}
