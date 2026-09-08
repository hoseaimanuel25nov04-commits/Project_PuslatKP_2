/**
 * App.jsx
 * Shell aplikasi PUSLATKP Management Hub
 * State-based routing murni, dark mode switch, role protection, dan public view support.
 */
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Login from './pages/Login'
import DashboardHome from './pages/DashboardHome'
import DailyActivity from './pages/DailyActivity'
import Highlights from './pages/Highlights'
import Documents from './pages/Documents'
import PilihJenisData from './pages/InputData/PilihJenisData'
import KelolaAkunUPT from './pages/admin/KelolaAkunUPT'
import KelolaJenisData from './pages/admin/KelolaJenisData'
import RekapEksporSemuaUPT from './pages/admin/RekapEksporSemuaUPT'
import PublikView from './pages/PublikView'
import { Loader2 } from 'lucide-react'

const PAGE_TITLES = {
  dashboard: 'Dashboard Tim Kerja',
  highlights: 'Highlights & Capaian',
  'daily-activity': 'Daily Activity & Laporan',
  'input-data': 'Input Data & Pelaporan',
  'kelola-upt': 'Administrasi UPT',
  'kelola-jenis-data': 'Kelola & Definisi Jenis Data',
  'rekap-ekspor': 'Rekapitulasi & Ekspor Semua UPT',
  documents: 'Documents & Guidelines',
}

function MainAppShell() {
  const { session, profile, loading, isAdmin } = useAuth()
  const [activePage, setActivePage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('page') || 'dashboard'
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('puslatkp_theme') === 'dark' ||
      (!('puslatkp_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Sinkronisasi kelas dark mode ke <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('puslatkp_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('puslatkp_theme', 'light')
    }
  }, [darkMode])

  // Listener navigasi kustom dari komponen non-direct
  useEffect(() => {
    const handleCustomNav = (e) => {
      if (e.detail) setActivePage(e.detail)
    }
    window.addEventListener('navigate', handleCustomNav)
    return () => window.removeEventListener('navigate', handleCustomNav)
  }, [])

  // Responsif mobile auto collapse
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  // Jika halaman publik dipilih, render PublikView langsung tanpa login & tanpa sidebar
  if (activePage === 'publik') {
    return (
      <PublikView
        onLoginClick={() => setActivePage('dashboard')}
      />
    )
  }

  // Jika sedang memuat session Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1830] flex flex-col items-center justify-center text-white">
        <Loader2 size={36} className="animate-spin text-blue-500 mb-3" />
        <p className="text-sm font-medium text-white/70">Memuat PUSLATKP Management Hub...</p>
      </div>
    )
  }

  // Jika belum login, tampilkan Login page
  if (!session) {
    return <Login />
  }

  // Render halaman aktif di dalam App Shell
  function renderActivePage() {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome onNavigate={setActivePage} />
      case 'highlights':
        return <Highlights />
      case 'daily-activity':
        return <DailyActivity />
      case 'input-data':
        return <PilihJenisData />
      case 'documents':
        return <Documents />
      case 'kelola-upt':
        return isAdmin ? <KelolaAkunUPT /> : <DashboardHome onNavigate={setActivePage} />
      case 'kelola-jenis-data':
        return isAdmin ? <KelolaJenisData /> : <DashboardHome onNavigate={setActivePage} />
      case 'rekap-ekspor':
        return isAdmin ? <RekapEksporSemuaUPT /> : <DashboardHome onNavigate={setActivePage} />
      default:
        return <DashboardHome onNavigate={setActivePage} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F1A] text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-200">
      {/* Sidebar navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <TopBar
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(v => !v)}
          pageTitle={PAGE_TITLES[activePage] || 'PUSLATKP Management Hub'}
          onNavigate={setActivePage}
          onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  )
}
