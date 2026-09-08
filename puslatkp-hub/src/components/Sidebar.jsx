/**
 * components/Sidebar.jsx
 * Sidebar collapsible: 256px (terbuka) / 64px (tertutup)
 * Role-aware: menu Admin hanya untuk Admin
 */
import { useState } from 'react'
import {
  LayoutDashboard, Zap, ClipboardList, Database,
  Users, Settings, BarChart2, FileText,
  ChevronRight, ChevronLeft, ChevronDown,
  Building2, Globe
} from 'lucide-react'
import { useAuth } from '../AuthContext'

const LOGO_MARK = '🌊'

export default function Sidebar({ activePage, onNavigate, collapsed, onToggle }) {
  const { isAdmin, profile } = useAuth()
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false)

  const NavItem = ({ icon: Icon, label, page, badge }) => {
    const active = activePage === page
    return (
      <button
        onClick={() => onNavigate(page)}
        className={`sidebar-nav-item w-full ${active ? 'active' : ''}`}
        title={collapsed ? label : undefined}
      >
        <Icon size={18} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            {badge && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
          </>
        )}
      </button>
    )
  }

  const SectionLabel = ({ label }) => {
    if (collapsed) return <div className="my-2 border-t border-white/10" />
    return (
      <div className="px-3 pt-5 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</span>
      </div>
    )
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col transition-all duration-300 ease-in-out
        bg-[#0B1830] border-r border-white/10
        ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-lg flex-shrink-0">
          {LOGO_MARK}
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">PUSLATKP</div>
            <div className="text-white/40 text-[10px] leading-tight">Management Hub</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        <SectionLabel label="Team Portal" />
        <NavItem icon={LayoutDashboard} label="Dashboard" page="dashboard" />

        <SectionLabel label="Execution & Monitoring" />
        <NavItem icon={Zap} label="Highlights" page="highlights" />
        <NavItem icon={ClipboardList} label="Daily Activity" page="daily-activity" />

        <SectionLabel label="Data & Pelaporan" />
        {/* Input Data — dropdown di expanded, single item di collapsed */}
        {collapsed ? (
          <NavItem icon={Database} label="Input Data" page="input-data" />
        ) : (
          <div>
            <button
              onClick={() => setDataDropdownOpen(prev => !prev)}
              className={`sidebar-nav-item w-full ${activePage === 'input-data' ? 'active' : ''}`}
            >
              <Database size={18} className="flex-shrink-0" />
              <span className="flex-1 text-left">Input Data</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${dataDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dataDropdownOpen && (
              <div className="ml-6 mt-1 space-y-0.5 animate-fade-in">
                <button
                  onClick={() => onNavigate('input-data')}
                  className="sidebar-nav-item w-full text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  Pilih Jenis Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* ADMIN SECTION */}
        {isAdmin && (
          <>
            <SectionLabel label="Administrasi" />
            <NavItem icon={Users} label="Kelola Akun UPT" page="kelola-upt" />
            <NavItem icon={Settings} label="Kelola Jenis Data" page="kelola-jenis-data" />
            <NavItem icon={BarChart2} label="Rekap & Ekspor" page="rekap-ekspor" />
          </>
        )}

        <SectionLabel label="Repositories" />
        <NavItem icon={FileText} label="Documents" page="documents" />
      </nav>

      {/* Footer: User info + collapse toggle */}
      <div className="border-t border-white/10 px-2 py-3 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2 rounded-lg bg-white/5">
            <div className="text-white text-xs font-semibold truncate">
              {profile?.nama_lengkap || 'Pengguna'}
            </div>
            <div className="text-white/50 text-[10px] capitalize">
              {profile?.role || '-'} {profile?.upt_key ? `• ${profile.upt_key}` : ''}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="sidebar-nav-item w-full justify-center"
          title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-xs">Tutup sidebar</span>}
        </button>
      </div>
    </aside>
  )
}
