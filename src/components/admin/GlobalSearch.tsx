'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ClientResult = { id: string; name: string; mobile?: string }
type OrderResult = {
  id: string
  orderNumber: string
  status: string
  clientName: string
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Ανοιχτή',
  in_progress: 'Σε Εξέλιξη',
  completed: 'Ολοκληρώθηκε',
  cancelled: 'Ακυρώθηκε',
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<ClientResult[]>([])
  const [orders, setOrders] = useState<OrderResult[]>([])
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setClients([])
      setOrders([])
      return
    }
    setLoading(true)
    try {
      const [cRes, oRes] = await Promise.all([
        fetch(
          `/api/clients?where[name][contains]=${encodeURIComponent(q)}&limit=5&sort=name`,
          { credentials: 'include' },
        ),
        fetch(
          `/api/service-orders?where[or][0][orderNumber][contains]=${encodeURIComponent(q)}&where[or][1][description][contains]=${encodeURIComponent(q)}&limit=5&sort=-date&depth=1`,
          { credentials: 'include' },
        ),
      ])
      const [cData, oData] = await Promise.all([cRes.json(), oRes.json()])

      setClients(
        (cData.docs ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          mobile: c.mobile,
        })),
      )
      setOrders(
        (oData.docs ?? []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          clientName:
            typeof o.client === 'object' ? o.client?.name ?? '—' : '—',
        })),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasResults = clients.length > 0 || orders.length > 0
  const showDropdown = open && query.trim().length >= 2

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Αναζήτηση πελατών, εντολών..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {!hasResults && !loading && (
            <p className="px-4 py-3 text-sm text-gray-400">Δεν βρέθηκαν αποτελέσματα.</p>
          )}

          {clients.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                Πελάτες
              </p>
              {clients.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/clients/${c.id}`}
                  onClick={() => { setOpen(false); setQuery('') }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 text-xs font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    {c.mobile && <p className="text-xs text-gray-400">{c.mobile}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {orders.length > 0 && (
            <div className={clients.length > 0 ? 'border-t border-gray-100' : ''}>
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                Εντολές Εργασίας
              </p>
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/dashboard/orders/${o.id}`}
                  onClick={() => { setOpen(false); setQuery('') }}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{o.orderNumber}</p>
                    <p className="text-xs text-gray-400">{o.clientName}</p>
                  </div>
                  <span className="text-xs text-gray-500">{STATUS_LABELS[o.status] ?? o.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
