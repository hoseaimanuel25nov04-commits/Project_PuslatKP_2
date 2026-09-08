/**
 * pages/Highlights.jsx
 * Ringkasan pencapaian dan sorotan kinerja mingguan/bulanan
 */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import InfoCard from '../components/InfoCard'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'
import {
  Zap, Award, TrendingUp, CheckCircle,
  Clock, AlertCircle, FileText, Calendar
} from 'lucide-react'

export default function Highlights() {
  const { isAdmin, uptKey } = useAuth()
  const [completedActivities, setCompletedActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHighlights()
  }, [uptKey, isAdmin])

  async function loadHighlights() {
    setLoading(true)
    let query = supabase
      .from('daily_activity')
      .select('*')
      .eq('status', 'selesai')
      .order('tanggal', { ascending: false })
      .limit(20)

    if (!isAdmin && uptKey) {
      query = query.eq('upt_key', uptKey)
    }

    const { data } = await query
    setCompletedActivities(data || [])
    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div
        className="rounded-2xl px-6 py-5 text-white"
        style={{ background: 'linear-gradient(135deg, #0B1830 0%, #10233F 100%)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-1">Execution & Monitoring</p>
        <h1 className="font-bold text-3xl font-display">Highlights Kinerja</h1>
        <p className="text-white/60 text-xs mt-1">
          Daftar capaian penting, output strategis, dan tonggak pelaksanaan kegiatan yang telah dituntaskan.
        </p>
      </div>

      {/* Highlights Feed */}
      <InfoCard title="Aktivitas & Output yang Telah Selesai">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : completedActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Zap size={36} className="mx-auto mb-2 opacity-30 text-amber-500" />
            <p className="text-sm">Belum ada aktivitas bertatus selesai yang tercatat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedActivities.map(act => (
              <div
                key={act.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900/60 hover:shadow-sm transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="badge-success">
                      <CheckCircle size={12} /> Selesai
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(act.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {act.uraian}
                  </h4>
                  {act.output && (
                    <div className="bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40 mb-3">
                      <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                        Output / Hasil Nyata
                      </div>
                      <p className="text-xs text-blue-950 dark:text-blue-200 line-clamp-2">
                        {act.output}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <span>UPT: <strong className="text-gray-700 dark:text-gray-300">{act.upt_key}</strong></span>
                  <span>PIC: {(act.pic || []).join(', ') || '-'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </InfoCard>
    </div>
  )
}
