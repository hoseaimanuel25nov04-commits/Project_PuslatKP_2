/**
 * components/PeriodSelector.jsx
 * Pemilih periode: Level tabs + navigasi prev/next + display deadline
 */
import { ChevronLeft, ChevronRight, Lock, Clock } from 'lucide-react'
import { formatTanggal, isPeriodLocked, sisaHari } from '../lib/deadline'

const LEVEL_LABELS = {
  tahun: 'Tahun',
  triwulan: 'Triwulan',
  bulan: 'Bulan',
  minggu: 'Minggu',
}

export default function PeriodSelector({
  level, onLevelChange,
  period, onPeriodChange,
  availablePeriods = [],
  allowedLevels = ['minggu', 'triwulan', 'tahun'],
}) {
  const displayLevels = allowedLevels || ['minggu', 'triwulan', 'tahun']
  // Filter periods by level
  const filtered = availablePeriods.filter(p => p.level === level)
  const currentIndex = filtered.findIndex(p => p.id === period?.id)

  const canPrev = currentIndex > 0
  const canNext = currentIndex < filtered.length - 1

  const locked = period ? isPeriodLocked(period.deadline) : false
  const remaining = period ? sisaHari(period.deadline) : null

  return (
    <div className="space-y-3">
      {/* Level Tabs (only if more than 1 allowed level) */}
      {displayLevels.length > 1 ? (
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
          {displayLevels.map(l => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                level === l
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {LEVEL_LABELS[l]}
            </button>
          ))}
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300">
          <span>Periode Level:</span>
          <span className="uppercase tracking-wider font-bold">{LEVEL_LABELS[displayLevels[0]]}</span>
        </div>
      )}

      {/* Period Navigator */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => canPrev && onPeriodChange(filtered[currentIndex - 1])}
          disabled={!canPrev}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Periode Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1">
          <select
            value={period?.id || ''}
            onChange={(e) => {
              const p = filtered.find(x => x.id === e.target.value)
              if (p) onPeriodChange(p)
            }}
            className="form-select text-sm font-semibold w-full max-w-xs"
          >
            {filtered.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => canNext && onPeriodChange(filtered[currentIndex + 1])}
          disabled={!canNext}
          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title="Periode Berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Deadline Info */}
      {period && (
        <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
          locked
            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
            : remaining !== null && remaining <= 7
            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
        }`}>
          {locked ? <Lock size={12} /> : <Clock size={12} />}
          {locked
            ? `Periode terkunci — deadline ${formatTanggal(period.deadline)}`
            : remaining !== null
            ? `Deadline: ${formatTanggal(period.deadline)} (${remaining > 0 ? `${remaining} hari lagi` : 'hari ini!'})`
            : `Deadline: ${formatTanggal(period.deadline)}`
          }
        </div>
      )}
    </div>
  )
}
