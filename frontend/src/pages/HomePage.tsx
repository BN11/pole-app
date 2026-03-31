import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, SPORT_LABELS, SPORT_ICONS } from '@/utils/api'
import { FieldCard } from '@/components/field/FieldCard'
import { SearchIcon, LocationIcon } from '@/components/ui/Icons'
import { useAuthStore } from '@/store/useAuthStore'
import type { Field } from '@/types'

const SPORT_FILTERS = [
  { key: 'ALL', label: 'Все', icon: '🏟️' },
  { key: 'FOOTBALL', label: SPORT_LABELS.FOOTBALL, icon: SPORT_ICONS.FOOTBALL },
  { key: 'BASKETBALL', label: SPORT_LABELS.BASKETBALL, icon: SPORT_ICONS.BASKETBALL },
  { key: 'TENNIS', label: SPORT_LABELS.TENNIS, icon: SPORT_ICONS.TENNIS },
  { key: 'VOLLEYBALL', label: SPORT_LABELS.VOLLEYBALL, icon: SPORT_ICONS.VOLLEYBALL },
]

export function HomePage() {
  const { user } = useAuthStore()
  const [activeSport, setActiveSport] = useState('ALL')

  const { data: popular, isLoading: loadingPopular } = useQuery<Field[]>({
    queryKey: ['fields', 'popular', activeSport],
    queryFn: async () => {
      const res = await api.get('/fields', {
        params: { sport: activeSport !== 'ALL' ? activeSport : undefined, sort: 'rating', limit: 10 },
      })
      return res.data.data
    },
  })

  const { data: nearby } = useQuery<Field[]>({
    queryKey: ['fields', 'nearby'],
    queryFn: async () => {
      const res = await api.get('/fields', { params: { sort: 'distance', limit: 5 } })
      return res.data.data
    },
  })

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">Привет,</p>
            <h1 className="text-xl font-bold text-white">
              {user?.firstName ?? 'Гость'} 👋
            </h1>
          </div>
          <button className="flex items-center gap-1.5 bg-surface border border-surface-border rounded-full px-3 py-2">
            <LocationIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm text-white font-medium">Ташкент</span>
            <span className="text-white/40 text-xs">▾</span>
          </button>
        </div>

        {/* Search */}
        <Link
          to="/fields"
          className="mt-4 flex items-center gap-3 bg-surface border border-surface-border rounded-2xl px-4 py-3.5"
        >
          <SearchIcon className="w-5 h-5 text-white/40" />
          <span className="text-white/40 text-sm">Поиск полей...</span>
        </Link>
      </div>

      {/* Sport filters */}
      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SPORT_FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveSport(key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeSport === key
                  ? 'bg-primary text-dark'
                  : 'bg-surface border border-surface-border text-white/70'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular fields */}
      <section className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="section-title">Популярные поля</h2>
          <Link to="/fields" className="text-primary text-sm font-medium">
            Смотреть все
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {loadingPopular
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[260px] h-[200px] rounded-2xl bg-surface animate-pulse" />
              ))
            : popular?.map((field) => (
                <FieldCard key={field.id} field={field} variant="large" />
              ))}
        </div>
      </section>

      {/* Nearby */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Рядом с вами</h2>
          <Link to="/fields?sort=distance" className="text-primary text-sm font-medium">
            На карте
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {nearby?.map((field) => (
            <FieldCard key={field.id} field={field} variant="compact" />
          ))}
        </div>
      </section>
    </div>
  )
}
