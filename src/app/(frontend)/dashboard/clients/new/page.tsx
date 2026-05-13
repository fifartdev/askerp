'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const MapPickerInner = dynamic(() => import('@/components/MapPickerInner'), { ssr: false })

const ADDRESS_TYPES = [
  { value: 'home', label: 'Κατοικία' },
  { value: 'work', label: 'Εργασία' },
  { value: 'office', label: 'Γραφείο' },
  { value: 'warehouse', label: 'Αποθήκη' },
  { value: 'other', label: 'Άλλο' },
]

type Address = {
  _key: string
  type: string
  address: string
  lat?: number
  lng?: number
  showMap: boolean
}

function newAddress(): Address {
  return {
    _key: crypto.randomUUID(),
    type: 'home',
    address: '',
    lat: undefined,
    lng: undefined,
    showMap: false,
  }
}

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState({ name: '', mobile: '', landline: '', notes: '' })
  const [addresses, setAddresses] = useState<Address[]>([])

  function updateAddress(key: string, patch: Partial<Address>) {
    setAddresses((prev) => prev.map((a) => (a._key === key ? { ...a, ...patch } : a)))
  }

  function removeAddress(key: string) {
    setAddresses((prev) => prev.filter((a) => a._key !== key))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      ...fields,
      addresses: addresses.map(({ _key, showMap, ...rest }) => rest),
    }

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.errors?.[0]?.message ?? 'Σφάλμα κατά την αποθήκευση.')
        return
      }

      router.push('/dashboard/clients')
      router.refresh()
    } catch {
      setError('Σφάλμα σύνδεσης.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clients" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Νέος Πελάτης</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700">Στοιχεία Επικοινωνίας</h3>

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
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Διευθύνσεις ({addresses.length})
            </h3>
            <button
              type="button"
              onClick={() => setAddresses((prev) => [...prev, newAddress()])}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Προσθήκη Διεύθυνσης
            </button>
          </div>

          {addresses.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center">
              <p className="text-sm text-gray-400">Δεν υπάρχουν διευθύνσεις. Προσθέστε μία.</p>
            </div>
          )}

          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr._key}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-36 flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Τύπος</label>
                    <select
                      value={addr.type}
                      onChange={(e) => updateAddress(addr._key, { type: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {ADDRESS_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Διεύθυνση</label>
                    <input
                      type="text"
                      value={addr.address}
                      onChange={(e) => updateAddress(addr._key, { address: e.target.value })}
                      placeholder="π.χ. Λεωφόρος Αθηνών 15, Αθήνα"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex-shrink-0 pt-5 flex items-center gap-1">
                    <button
                      type="button"
                      title={addr.showMap ? 'Απόκρυψη χάρτη' : 'Επιλογή στον χάρτη'}
                      onClick={() => updateAddress(addr._key, { showMap: !addr.showMap })}
                      className={`p-1.5 rounded-lg transition-colors ${
                        addr.showMap
                          ? 'bg-brand-100 text-brand-600'
                          : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Αφαίρεση"
                      onClick={() => removeAddress(addr._key)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {addr.showMap && (
                  <div className="pt-1">
                    <MapPickerInner
                      lat={addr.lat ?? 37.9838}
                      lng={addr.lng ?? 23.7275}
                      address={addr.address}
                      onChange={(lat, lng, address) =>
                        updateAddress(addr._key, { lat, lng, address })
                      }
                    />
                  </div>
                )}

                {addr.lat && addr.lng && (
                  <p className="text-xs text-gray-400">
                    📍 {addr.lat.toFixed(5)}, {addr.lng.toFixed(5)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </button>
          <Link
            href="/dashboard/clients"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Ακύρωση
          </Link>
        </div>
      </form>
    </div>
  )
}
