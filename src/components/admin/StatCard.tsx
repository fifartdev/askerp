type Props = {
  label: string
  value: string | number
  sub?: string
  colorClass?: string
}

export function StatCard({ label, value, sub, colorClass = 'bg-white' }: Props) {
  return (
    <div className={`${colorClass} rounded-xl border border-gray-200 p-5 shadow-sm`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
