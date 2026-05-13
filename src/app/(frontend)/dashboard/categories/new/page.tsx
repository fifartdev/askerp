'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/service-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.errors?.[0]?.message ?? 'Σφάλμα κατά την αποθήκευση.')
        return
      }

      router.push('/dashboard/categories')
      router.refresh()
    } catch {
      setError('Σφάλμα σύνδεσης.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/categories" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Νέα Κατηγορία</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Όνομα Κατηγορίας <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="π.χ. Συντήρηση Κλιματιστικών"
            />
            <p className="mt-1 text-xs text-gray-400">Το slug δημιουργείται αυτόματα.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
            <Link href="/dashboard/categories" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Ακύρωση
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
