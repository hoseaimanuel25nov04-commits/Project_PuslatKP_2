/**
 * pages/DashboardHome.jsx
 * Dashboard utama — kartu statistik, kalender aktivitas, highlight terkini
 */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import StatCard from '../components/StatCard'
import InfoCard from '../components/InfoCard'
import Badge from '../components/Badge'
import {
  Users, Target, TrendingUp, CheckCircle2, AlertTriangle,
  Calendar, BarChart3, Activity, ChevronLeft, ChevronRight,
  Clock, ClipboardList, Database, FileText
} from 'lucide-react'

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const DAYS_ID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

function MiniCalendar({ activitiesByDate = {}, onDateClick }) {
  const today = new Date()
  const [viewing, setViewing] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const firstDay = new Date(viewing.year, viewing.month, 1).getDay()
  const daysInMonth = new Date(viewing.year, viewing.month + 1, 0).getDate()
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  )

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewing(v => {
            const d = new Date(v.year, v.month - 1)
            return { year: d.getFullYear(), month: d.getMonth() }
          })}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {MONTHS_ID[viewing.month]} {viewing.year}
        </span>
        <button
          onClick={() => setViewing(v => {
            const d = new Date(v.year, v.month + 1)
            return { year: d.getFullYear(), month: d.getMonth() }
          })}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAYS_ID.map(d => (
          <div key={d} className="text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateStr = `${viewing.year}-${String(viewing.month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const hasActivity = activitiesByDate[dateStr]
          const isToday = day === today.getDate() && viewing.month === today.getMonth() && viewing.year === today.getFullYear()
          return (
            <button
              key={day}
              onClick={() => onDateClick?.(dateStr)}
              className={`text-xs py-1.5 rounded-md transition-colors font-medium
                ${isToday ? 'bg-blue-600 text-white' : ''}
                ${hasActivity && !isToday ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : ''}
                ${!isToday && !hasActivity ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardHome({ onNavigate }) {
  const { isAdmin, uptKey, profile } = useAuth()
  const [stats, setStats] = useState({
    totalAktivitas: 0,
    rencana: 0,
    realisasi: 0,
    selesai: 0,
    masalah: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [activitiesByDate, setActivitiesByDate] = useState({})
  const [jenisDataCount, setJenisDataCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [uptKey, isAdmin])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Load daily activities
      let query = supabase.from('daily_activity').select('*').order('tanggal', { ascending: false })
      if (!isAdmin && uptKey) query = query.eq('upt_key', uptKey)

      const { data: activities } = await query.limit(100)
      if (activities) {
        const byDate = {}
        activities.forEach(a => { byDate[a.tanggal] = true })
        setActivitiesByDate(byDate)
        setRecentActivities(activities.slice(0, 5))
        setStats({
          totalAktivitas: activities.length,
          rencana: activities.filter(a => a.status === 'draft').length,
          realisasi: activities.filter(a => a.status === 'proses').length,
          selesai: activities.filter(a => a.status === 'selesai').length,
          masalah: activities.filter(a => a.hambatan).length,
        })
      }

      // Load jenis data count
      const { count } = await supabase.from('jenis_data').select('*', { count: 'exact', head: true }).eq('aktif', true)
      setJenisDataCount(count || 0)
    } catch (err) {
      console.error('Error loading dashboard:', err)
    }
    setLoading(false)
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 11) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Siang'
    if (h < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1830 0%, #10233F 50%, #1a3a64 100%)' }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
          <div className="absolute right-8 top-8 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute right-16 bottom-4 w-20 h-20 border-2 border-white rounded-full" />
        </div>
        <div className="relative">
          <p className="text-blue-300 text-sm font-medium mb-1">{greeting()},</p>
          <h1 className="font-bold text-3xl font-display mb-2">
            {profile?.nama_lengkap || 'Pengguna'}
          </h1>
          <p className="text-white/60 text-sm">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {isAdmin ? ' · Akses Admin' : uptKey ? ` · ${uptKey}` : ''}
          </p>
        </div>
      </div>

      {/* Stat Cards — PROGRESS & STATUS */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Progress & Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Activity} color="bg-[#1E293B]" label="Total Aktivitas" value={stats.totalAktivitas} />
          <StatCard icon={Target} color="bg-blue-600" label="Rencana" value={stats.rencana} />
          <StatCard icon={TrendingUp} color="bg-amber-500" label="Realisasi Berjalan" value={stats.realisasi} />
          <StatCard icon={CheckCircle2} color="bg-emerald-500" label="Selesai" value={stats.selesai} />
          <StatCard icon={AlertTriangle} color="bg-rose-500" label="Permasalahan" value={stats.masalah} />
        </div>
      </div>

      {/* Two column: Calendar + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <InfoCard title="Kalender Aktivitas" className="lg:col-span-1">
          <MiniCalendar
            activitiesByDate={activitiesByDate}
            onDateClick={(date) => onNavigate('daily-activity')}
          />
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Hari ini
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Ada aktivitas
            </span>
          </div>
        </InfoCard>

        {/* Recent Activities */}
        <InfoCard
          title="Aktivitas Terkini"
          action={
            <button onClick={() => onNavigate('daily-activity')} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              Lihat semua →
            </button>
          }
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Activity size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map(act => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    act.status === 'selesai' ? 'bg-emerald-500' :
                    act.status === 'proses' ? 'bg-amber-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-1 font-medium">
                      {act.uraian || 'Tanpa uraian'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {new Date(act.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      {act.upt_key && ` · ${act.upt_key}`}
                    </p>
                  </div>
                  <Badge variant={act.status === 'selesai' ? 'success' : act.status === 'proses' ? 'warning' : 'draft'}>
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </InfoCard>
      </div>

      {/* Quick Actions */}
      <InfoCard title="Akses Cepat">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ClipboardList, label: 'Input Aktivitas', page: 'daily-activity', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { icon: Database, label: 'Input Data', page: 'input-data', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
            { icon: BarChart3, label: 'Highlights', page: 'highlights', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
            { icon: FileText, label: 'Documents', page: 'documents', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
          ].map(item => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all duration-200 group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>
      </InfoCard>
    </div>
  )
}
