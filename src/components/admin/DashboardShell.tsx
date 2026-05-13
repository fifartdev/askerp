'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import type { AuthUser } from '@/lib/auth'

type Props = {
  user: AuthUser
  children: React.ReactNode
}

export function DashboardShell({ user, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            aria-label="Άνοιγμα μενού"
            className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="flex-1 text-sm font-medium text-gray-500">AskService ERP</h1>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <span className="text-brand-700 text-xs font-bold">
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user.name ?? user.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
