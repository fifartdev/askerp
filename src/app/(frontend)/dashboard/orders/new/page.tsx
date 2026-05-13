'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

type SelectOption = { id: string; name: string }

type ClientAddress = {
  id: string
  type: string
  address: string
  lat?: number
  lng?: number
}

const ADDRESS_TYPE_LABELS: Record<string, string> = {
  home: 'Κατοικία',
  work: 'Εργασία',
  office: 'Γραφείο',
  warehouse: 'Αποθήκη',
  other: 'Άλλο',
}

function NewOrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClient = searchParams.get('client') ?? ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<SelectOption[]>([])
  const [categories, setCategories] = useState<SelectOption[]>([])
  const [clientAddresses, setClientAddresses] = useState<ClientAddress[]>([])
  const [fields, setFields] = useState({
    client: preselectedClient,
    category: '',
    date: new Date().toISOString().split('T')[0],
    price: '',
    description: '',
    status: 'open',
  })
  const [serviceAddress, setServiceAddress] = useState({
    addressType: '',
    address: '',
    lat: 0,
    lng: 0,
  })

  // Load clients + categories on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/clients?limit=200&sort=name', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/service-categories?limit=100&sort=name', { credentials: 'include' }).then((r) =>
        r.json(),
      ),
    ]).then(([c, cat]) => {
      setClients(c.docs ?? [])
      setCategories(cat.docs ?? [])
    })
  }, [])

  // Fetch addresses when client changes
  useEffect(() => {
    if (!fields.client) {
      setClientAddresses([])
      setServiceAddress({ addressType: '', address: '', lat: 0, lng: 0 })
      return
    }
    fetch(`/api/clients/${fields.client}?depth=0`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const addrs: ClientAddress[] = (data.addresses ?? []).map((a: any) => ({
          id: a.id,
          type: a.type,
          address: a.address ?? '',
          lat: a.lat,
          lng: a.lng,
        }))
        setClientAddresses(addrs)
        // Auto-select first address
        if (addrs.length > 0) {
          setServiceAddress({
            addressType: ADDRESS_TYPE_LABELS[addrs[0].type] ?? addrs[0].type,
            address: addrs[0].address,
            lat: addrs[0].lat ?? 0,
            lng: addrs[0].lng ?? 0,
          })
        } else {
          setServiceAddress({ addressType: '', address: '', lat: 0, lng: 0 })
        }
      })
  }, [fields.client])

  function handleAddressSelect(addrId: string) {
    const addr = clientAddresses.find((a) => a.id === addrId)
    if (!addr) return
    setServiceAddress({
      addressType: ADDRESS_TYPE_LABELS[addr.type] ?? addr.type,
      address: addr.address,
      lat: addr.lat ?? 0,
      lng: addr.lng ?? 0,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/service-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...fields,
          client: fields.client ? Number(fields.client) : undefined,
          category: fields.category ? Number(fields.category) : undefined,
          price: parseFloat(fields.price) || 0,
          serviceAddress: serviceAddress.address ? serviceAddress : undefined,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.errors?.[0]?.message ?? 'Σφάλμα κατά την αποθήκευση.')
        return
      }

      const json = await res.json()
      router.push(`/dashboard/orders/${json.doc?.id ?? ''}`)
      router.refresh()
    } catch {
      setError('Σφάλμα σύνδεσης.')
    } finally {
      setLoading(false)
    }
  }

  const set =
    (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Νέα Εντολή Εργασίας</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              Πελάτης <span className="text-red-500">*</span>
            </label>
            <select
              id="client"
              required
              value={fields.client}
              onChange={set('client')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">Επιλέξτε πελάτη...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Address selector — shows only when client has addresses */}
          {clientAddresses.length > 0 && (
            <div>
              <label htmlFor="addressSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Διεύθυνση Εργασίας
              </label>
              <select
                id="addressSelect"
                onChange={(e) => handleAddressSelect(e.target.value)}
                defaultValue={clientAddresses[0]?.id}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                {clientAddresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {ADDRESS_TYPE_LABELS[a.type] ?? a.type}
                    {a.address ? ` — ${a.address}` : ''}
                  </option>
                ))}
              </select>
              {serviceAddress.address && (
                <p className="mt-1 text-xs text-gray-400 truncate">📍 {serviceAddress.address}</p>
              )}
            </div>
          )}

          {/* No addresses warning */}
          {fields.client && clientAddresses.length === 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
              <p className="text-xs text-yellow-700">
                Ο πελάτης δεν έχει διευθύνσεις. Μπορείτε να προσθέσετε μέσω{' '}
                <Link href={`/dashboard/clients/${fields.client}/edit`} className="underline font-medium">
                  επεξεργασίας πελάτη
                </Link>
                .
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Κατηγορία Υπηρεσίας <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={fields.category}
              onChange={set('category')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="">Επιλέξτε κατηγορία...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Ημερομηνία <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                type="date"
                required
                value={fields.date}
                onChange={set('date')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Τιμή (€) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                required
                min="0"
                step="0.01"
                value={fields.price}
                onChange={set('price')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Κατάσταση
            </label>
            <select
              id="status"
              value={fields.status}
              onChange={set('status')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="open">Ανοιχτή</option>
              <option value="in_progress">Σε Εξέλιξη</option>
              <option value="completed">Ολοκληρώθηκε</option>
              <option value="cancelled">Ακυρώθηκε</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Σύντομη Περιγραφή
            </label>
            <textarea
              id="description"
              rows={3}
              value={fields.description}
              onChange={set('description')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </button>
            <Link href="/dashboard/orders" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Ακύρωση
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <Suspense>
      <NewOrderForm />
    </Suspense>
  )
}
