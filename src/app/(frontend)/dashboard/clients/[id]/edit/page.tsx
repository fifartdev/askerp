'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [fields, setFields] = useState({ name: '', mobile: '', landline: '', notes: '' })

  useEffect(() => {
    fetch(`/api/clients/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setFields({
          name: data.name ?? '',
          mobile: data.mobile ?? '',
          landline: data.landline ?? '',
          notes: data.notes ?? '',
        })
      })
      .finally(() => setFetching(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(fields),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.errors?.[0]?.message ?? 'Σφάλμα κατά την αποθήκευση.')
        return
      }

      router.push(`/dashboard/clients/${id}`)
      router.refresh()
    } catch {
      setError('Σφάλμα σύνδεσης.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm text-gray-400">Φόρτωση...</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/clients/${id}`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Επεξεργασία Πελάτη</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Ονοματεπώνυμο / Επωνυμία <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={fields.name}
              onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Κινητό Τηλέφωνο
              </label>
              <input
                id="mobile"
                type="tel"
                value={fields.mobile}
                onChange={(e) => setFields((f) => ({ ...f, mobile: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="landline" className="block text-sm font-medium text-gray-700 mb-1">
                Σταθερό Τηλέφωνο
              </label>
              <input
                id="landline"
                type="tel"
                value={fields.landline}
                onChange={(e) => setFields((f) => ({ ...f, landline: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Σημειώσεις
            </label>
            <textarea
              id="notes"
              rows={3}
              value={fields.notes}
              onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
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
            <Link
              href={`/dashboard/clients/${id}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Ακύρωση
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
