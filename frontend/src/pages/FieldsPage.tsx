import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, SPORT_LABELS, SPORT_ICONS } from '@/utils/api'
import { FieldCard } from '@/components/field/FieldCard'
import { SearchIcon, FilterIcon } from '@/components/ui/Icons'
import type { Field } from '@/types'

const SPORT_FILTERS = [
  { key: 'ALL', label: 'Все' },
  { key: 'FOOTBALL', label: SPORT_LABELS.FOOTBALL, icon: SPORT_ICONS.FOOTBALL },
  { key: 'BASKETBALL', label: SPORT_LABELS.BASKETBALL, icon: SPORT_ICONS.BASKETBALL },
  { key: 'TENNIS', label: SPORT_LABELS.TENNIS, icon: SPORT_ICONS.TENNIS },
  { key: 'VOLLEYBALL', label: SPORT_LABELS.VOLLEYBALL, icon: SPORT_ICONS.VOLLEYBALL },
]

export function FieldsPage() {
  const [search, setSearch] = useState('')
  const [activeSport, setActiveSport] = useState('ALL')

  const { data, isLoading } = useQuery<Field[]>({
    queryKey: ['fields', 'list', activeSport, search],
    queryFn: async () => {
      const res = await api.get('/fields', {
        params: {
          sport: activeSport !== 'ALL' ? activeSport : undefined,
          search: search || undefined,
          limit: 20,
        },
      })
      return res.data.data
    },
  })

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 sticky top-0 bg-dark z-10">
        <h1 className="text-xl font-bold text-white mb-3">Поля</h1>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-surface border border-surface-border rounded-2xl px-4 py-3">
            <SearchIcon className="w-4 h-4 text-white/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Поиск полей..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/40 outline-none"
            />
          </div>
          <button className="flex-shrink-0 w-12 h-12 bg-surface border border-surface-border rounded-2xl flex items-center justify-center">
            <FilterIcon className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Sport chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {SPORT_FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveSport(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeSport === key
                  ? 'bg-primary text-dark'
                  : 'bg-surface border border-surface-border text-white/70'
              }`}
            >
              {icon && <span>{icon}</span>}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-2">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🏟️</span>
            <p className="text-white font-semibold">Поля не найдены</p>
            <p className="text-white/50 text-sm mt-1">Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data?.map((field) => (
              <FieldCard key={field.id} field={field} variant="compact" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
