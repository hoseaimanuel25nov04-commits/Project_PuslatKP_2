/**
 * components/TopBar.jsx
 * Header bar: dark mode toggle + user info + sign out
 */
import { Sun, Moon, LogOut, Bell, Globe } from 'lucide-react'
import { useAuth } from '../AuthContext'

export default function TopBar({ darkMode, onToggleDark, pageTitle, onNavigate, onToggleSidebar }) {
  const { profile, signOut, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 sm:px-6 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Buka/Tutup Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Page title */}
        <h1 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
          {pageTitle || 'PUSLATKP Management Hub'}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Public view link */}
        <button
          onClick={() => onNavigate?.('publik')}
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Tampilan Publik"
        >
          <Globe size={14} />
          <span>Publik</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification bell (placeholder) */}
        <button className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell size={16} />
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
              {profile?.nama_lengkap || 'Pengguna'}
            </div>
            <div className="text-[10px] text-gray-400 capitalize">
              {profile?.role}
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(profile?.nama_lengkap || 'P')[0].toUpperCase()}
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Keluar"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
